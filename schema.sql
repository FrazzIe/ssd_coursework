/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

CREATE DATABASE IF NOT EXISTS `bug_tracker` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `bug_tracker`;

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `creator_id` bigint(20) NOT NULL,
  `assigned_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `title` varchar(125) NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT 0,
  `discover_phase` tinyint(4) NOT NULL DEFAULT 0,
  `priority` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_user_ticket` (`creator_id`),
  KEY `fk_user_ticket_2` (`assigned_id`),
  CONSTRAINT `fk_user_ticket` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_ticket_2` FOREIGN KEY (`assigned_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;

-- Dumping structure for table bug_tracker.ticket_comments
CREATE TABLE IF NOT EXISTS `ticket_comments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ticket_id` bigint(20) NOT NULL,
  `creator_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `comment` text NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `fk_ticket_comment` (`ticket_id`),
  KEY `fk_user_comment` (`creator_id`),
  CONSTRAINT `fk_ticket_comment` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_comment` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40000 ALTER TABLE `ticket_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_comments` ENABLE KEYS */;

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` char(95) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `group` varchar(50) NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `username`, `password`, `created_at`, `group`) VALUES
	(1, 'User123', '$argon2i$v=19$m=4096,t=3,p=1$6Ym1mt0uve/bLrKL/Udltg$YMJTWc71LVVhMC+ivbJeTzc7+riyLPyd0nYNOnO/Xqw', '2020-12-03 19:17:30', 'user'),
	(2, 'Client123', '$argon2i$v=19$m=4096,t=3,p=1$8bX1vbHLjBtS+uCBNohzzA$CtWdWqiESDKaUN45Nl72+pnvhoEK19gYBuuieMc/LPM', '2020-12-03 19:18:05', 'client'),
	(3, 'Tester123', '$argon2i$v=19$m=4096,t=3,p=1$G9x0+TUWCtyP07nXik6sUg$NgoWlBjurbK3bxsWu8y+EOYnUh12iZoLEN/eCoADUl4', '2020-12-03 19:18:19', 'tester'),
	(4, 'Developer123', '$argon2i$v=19$m=4096,t=3,p=1$y2rnJsqfRFoIpvmNqWt4aw$Mz8ABurogfvV9nm+u1blL2pc1vQP/+Gh0pv3qXaDgzw', '2020-12-03 19:18:41', 'developer'),
	(5, 'Admin123', '$argon2i$v=19$m=4096,t=3,p=1$Fm3eshnuB51YrGZnwsU/mA$VLUnayqqJz8s9PlmbwKhA4FnHHkEqBk5wSIiRuu3lms', '2020-12-03 19:19:12', 'admin'),
	(6,	'Developer1234', '$argon2i$v=19$m=4096,t=3,p=1$i1qPIICTAbwfkpD55YIz9Q$EsWZu/Sfxi0353Oj55sR2QreS5Vx2T7imqL6L1Rg6n0', '2020-12-11 19:12:20', 'developer');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;