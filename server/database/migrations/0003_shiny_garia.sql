CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`og_image` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `products` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `products` ADD `meta_description` text;