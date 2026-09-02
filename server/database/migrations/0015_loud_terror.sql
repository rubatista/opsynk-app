CREATE TABLE `transaction_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_id` integer NOT NULL,
	`amount` real NOT NULL,
	`date` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `client_transactions`(`id`) ON UPDATE no action ON DELETE cascade
);
