# Listening to a research Sheet, with optional Records

**Request:** “Review the profiles already collected by this Listening and score them in its managed Sheet. Do not add them to CRM.”

1. Resolve the Listening and inspect its actual Engagers capture rule, bound `sheetId`, run state and destination rows. A configured destination or latest-run counter alone proves neither delivery nor total rows.
2. Use the owning Sheet schema and requested rubric. Preserve locked source/identity fields, original post URLs and Profile type. Keep Person, Company, Unknown, low-scoring and incomplete candidates. Collection approval is not paid Enrich approval; inspect any separately requested binding, selection and cost.
3. Read back actual rows and completed custom cells. Report partial/queued cells as such; a capacity deferral or timeout is not a provider miss.

**Optional next stage:** only if the user subsequently selects CRM admission, resolve Unknown profiles, inspect existing identities and import selected Person/Company candidates through native Records import. Preserve Sheet source links; do not promote Sheet-specific scores to shared facts automatically. A List is optional after admission. Campaign enrollment and sending need their own request and native authority.

**Unknown result:** inspect the original run/import and destination before retrying. Reuse the existing card/rule/Sheet and exact continuation. Do not create a replacement paid capture card, delete candidates or infer success from saved settings.
