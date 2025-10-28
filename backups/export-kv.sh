#!/bin/bash
echo "Exporting KV data..."
npx wrangler kv key get "basic_settings:company_address" --binding KV > kv-company_address.txt
npx wrangler kv key get "basic_settings:company_email" --binding KV > kv-company_email.txt
npx wrangler kv key get "basic_settings:company_logo" --binding KV > kv-company_logo.txt
npx wrangler kv key get "basic_settings:company_name" --binding KV > kv-company_name.txt
npx wrangler kv key get "basic_settings:company_phone" --binding KV > kv-company_phone.txt
npx wrangler kv key get "basic_settings:contact_person" --binding KV > kv-contact_person.txt
echo "KV export complete!"
