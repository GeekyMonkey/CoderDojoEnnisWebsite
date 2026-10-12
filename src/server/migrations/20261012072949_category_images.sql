-- Image metadata is separate from editable category text and guarded by revision.
alter table coderdojo.badge_categories add column if not exists has_image boolean not null default false;
alter table coderdojo.badge_categories add column if not exists image_revision uuid;
-- Preserve existing legacy JPG images without claiming missing images are populated.
update coderdojo.badge_categories as category set has_image = true
where image_revision is null and exists (
 select 1 from storage.objects as object where object.bucket_id = 'coderdojo'
 and object.name = 'BadgeCategories/BadgeCategory_' || replace(category.id::text, '-', '') || '.jpg'
);
