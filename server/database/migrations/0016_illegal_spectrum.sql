CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`number` text NOT NULL,
	`source_type` text,
	`source_id` integer,
	`client_id` integer,
	`buyer_name` text,
	`buyer_contact` text,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `documents_number_unique` ON `documents` (`number`);--> statement-breakpoint
ALTER TABLE `site_settings` ADD `company_name` text;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `company_nif` text;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `company_address` text;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `company_phone` text;--> statement-breakpoint
ALTER TABLE `site_settings` ADD `company_email` text;