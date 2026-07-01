CREATE TABLE `daily_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`goalMl` int NOT NULL DEFAULT 2000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hydration_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`drinkType` varchar(50) NOT NULL,
	`amountMl` int NOT NULL,
	`logDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hydration_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `daily_goals` ADD CONSTRAINT `daily_goals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hydration_logs` ADD CONSTRAINT `hydration_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;