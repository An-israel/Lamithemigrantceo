-- ===========================================================================
-- Rename "programs" to "products" site-wide, per client request. Renames the
-- table and every column/foreign key that referenced it, and carries RLS
-- policies and indexes across under matching new names. Existing orders rows
-- with item_type = 'program' are left as historical data — the app treats
-- 'program' and 'product' as equivalent on read, and writes 'product' going
-- forward.
-- ===========================================================================

alter table public.programs rename to products;

alter table public.testimonials rename column program_id to product_id;
alter table public.applications rename column program_id to product_id;
alter table public.applications rename column program_name to product_name;
alter table public.program_modules rename to product_modules;
alter table public.product_modules rename column program_id to product_id;

-- Policy identities follow the table automatically on rename, but rename the
-- names themselves for clarity.
alter policy programs_public_read on public.products rename to products_public_read;
alter policy programs_admin_write on public.products rename to products_admin_write;
alter policy program_modules_admin_write on public.product_modules rename to product_modules_admin_write;
alter policy program_modules_student_read on public.product_modules rename to product_modules_student_read;

alter index if exists idx_programs_sort rename to idx_products_sort;
alter index if exists idx_program_modules_program rename to idx_product_modules_product;
