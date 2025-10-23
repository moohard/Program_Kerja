/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 11.8.3-MariaDB-log : Database - proker_papenajam
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `jabatan` */

DROP TABLE IF EXISTS `jabatan`;

CREATE TABLE `jabatan` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `nama_jabatan` varchar(100) NOT NULL,
  `role` enum('admin','manajer','pengawas','staff') NOT NULL,
  `bidang` enum('pimpinan','kesekretariatan','kepaniteraan','teknis','hakim') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `jabatan_parent_id_foreign` (`parent_id`),
  CONSTRAINT `jabatan_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `jabatan` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `jabatan` */

insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (1,NULL,'Administrator','admin','teknis','2025-10-22 06:42:37','2025-10-22 06:42:37');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (2,NULL,'Ketua','manajer','pimpinan','2025-10-22 06:42:37','2025-10-22 06:42:37');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (3,2,'Wakil Ketua','manajer','pimpinan','2025-10-22 06:42:37','2025-10-22 06:42:37');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (4,3,'Hakim','manajer','hakim','2025-10-22 06:42:37','2025-10-23 00:24:05');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (5,3,'Sekretaris','manajer','kesekretariatan','2025-10-22 06:42:37','2025-10-23 00:23:57');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (6,5,'Kepala Sub Bagian Umum dan Keuangan','pengawas','kesekretariatan','2025-10-22 06:42:37','2025-10-23 00:13:22');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (7,6,'Pelaksana Umum dan Keuangan','staff','kesekretariatan','2025-10-22 06:42:37','2025-10-23 00:19:20');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (8,3,'Panitera','manajer','kepaniteraan','2025-10-22 06:42:37','2025-10-23 00:24:28');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (9,8,'Panitera Muda Permohonan','pengawas','kepaniteraan','2025-10-22 06:42:37','2025-10-23 00:20:37');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (10,9,'Pelaksana Panitera Muda Permohonan','staff','kepaniteraan','2025-10-22 06:42:37','2025-10-23 00:21:46');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (11,8,'Panitera Pengganti','staff','kepaniteraan','2025-10-22 06:42:37','2025-10-22 06:42:37');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (12,8,'Jurusita','staff','kepaniteraan','2025-10-22 06:42:37','2025-10-22 06:42:37');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (13,8,'Jurusita Pengganti','staff','kepaniteraan','2025-10-22 06:42:37','2025-10-22 06:42:37');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (14,5,'Kepala Sub Bagian Kepegawaian dan Ortala','admin','kesekretariatan','2025-10-23 00:13:45','2025-10-23 00:13:45');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (15,5,'Kepala Sub Bagian Perencanaan, Teknologi Informasi dan Pelaporan','admin','kesekretariatan','2025-10-23 00:14:26','2025-10-23 00:14:26');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (18,14,'Pelaksana Kepegawaian dan Ortala','admin','kesekretariatan','2025-10-23 00:19:42','2025-10-23 00:19:42');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (19,15,'Pelaksana Perencanaan, Teknologi Informasi dan Pelaporan','admin','kesekretariatan','2025-10-23 00:20:11','2025-10-23 00:20:11');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (20,8,'Panitera Muda Gugatan','admin','kepaniteraan','2025-10-23 00:20:56','2025-10-23 00:20:56');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (21,8,'Panitera Muda Hukum','admin','kepaniteraan','2025-10-23 00:21:24','2025-10-23 00:21:24');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (22,20,'Pelaksana Panitera Muda Gugatan','admin','kepaniteraan','2025-10-23 00:23:08','2025-10-23 00:23:08');
insert  into `jabatan`(`id`,`parent_id`,`nama_jabatan`,`role`,`bidang`,`created_at`,`updated_at`) values (23,21,'Pelaksana Panitera Muda Hukum','admin','kepaniteraan','2025-10-23 00:23:28','2025-10-23 00:23:28');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
