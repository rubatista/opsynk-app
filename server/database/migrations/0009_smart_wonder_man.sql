CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'novo' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
