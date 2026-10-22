// Small deterministic ZIP writer: stored entries, fixed timestamps, no dependencies.
export function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

export function zip(entries) {
  const local = [], central = []
  let offset = 0
  for (const entry of [...entries].sort((a, b) => a.name.localeCompare(b.name, "en"))) {
    if (!entry.name || entry.name.split("/").some(part => !part || part === "." || part === "..") || /[\\\x00-\x1f\x7f]/.test(entry.name)) throw new Error("unsafe ZIP path")
    const name = Buffer.from(entry.name), bytes = entry.bytes, crc = crc32(bytes)
    const header = Buffer.alloc(30)
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6)
    header.writeUInt16LE(33, 12); header.writeUInt32LE(crc, 14)
    header.writeUInt32LE(bytes.length, 18); header.writeUInt32LE(bytes.length, 22); header.writeUInt16LE(name.length, 26)
    local.push(header, name, bytes)
    const record = Buffer.alloc(46)
    record.writeUInt32LE(0x02014b50); record.writeUInt16LE(0x0314, 4); record.writeUInt16LE(20, 6); record.writeUInt16LE(0x800, 8)
    record.writeUInt16LE(33, 14); record.writeUInt32LE(crc, 16)
    record.writeUInt32LE(bytes.length, 20); record.writeUInt32LE(bytes.length, 24); record.writeUInt16LE(name.length, 28)
    record.writeUInt32LE(((entry.mode === "100755" ? 0o100755 : 0o100644) << 16) >>> 0, 38)
    record.writeUInt32LE(offset, 42)
    central.push(record, name)
    offset += header.length + name.length + bytes.length
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...local, directory, end])
}
