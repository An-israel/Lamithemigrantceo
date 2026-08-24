-- Renames the self-paced £97 product from "The £200 Starter" to
-- "Start Your Product Biz" per Lami's request. Slug is left unchanged so
-- existing links and orders keep working.
update products set name = 'Start Your Product Biz' where slug = 'the-200-starter';
