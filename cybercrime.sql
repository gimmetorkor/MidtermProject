-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 10, 2024 at 09:00 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cybercrime`
--

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

CREATE TABLE `member` (
  `id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(200) NOT NULL,
  `name` varchar(50) NOT NULL,
  `gender` varchar(10) NOT NULL,
  `birthday` date NOT NULL,
  `email` varchar(50) NOT NULL,
  `tel` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member`
--

INSERT INTO `member` (`id`, `username`, `password`, `name`, `gender`, `birthday`, `email`, `tel`) VALUES
(1, 'tk', '$2a$10$0eh0NUMB3fe802YrlAeXRulqyMDN6Mz88pB3punzclq3KC4cA7OB2', 'แตงกวา', 'female', '2004-02-05', 'panttpa1@gmail.com', '0617433571'),
(21, 'tkk', '$2b$10$FPSiipDmFTu2uGE5HCZJ2uktweNDtbpWZRcCRqZhiHJzC04IsMqni', 'tkk', 'หญิง', '1989-10-18', 'tkk@gmail.com', '0987685789'),
(22, 'jaa', '$2a$10$8FD8WM5EHQ4AwlDGNXFhru3VscrFZPOYFF68VX4BCLMCjpacqVZuC', 'jaa', 'ชาย', '2004-02-02', 'jaatomato@gmail.com', '0953859790'),
(24, 'teacher', '$2a$10$X/NUeEesj3tk4U4aIBDN5epRed7ZkrG28fkgftwJ/t5beLwwEOu2O', 'อาจารย์สิทธิชัย', 'ชาย', '1983-04-03', 'oak@gmail.com', '0984565789'),
(25, 'nano', '$2a$10$YqZrVm0CxnZ1ygZy3xLC/.vx4E6CINMZIsw7JZeqrbRJ7Y6g7m0YC', 'nano', 'หญิง', '2003-10-20', 'nano@gmail.com', '0987776656'),
(26, 'dao', '$2a$10$ubb4vxJlNFl9hPaczzg1DOolcghJdNLYi7hlhZOOV.DiV2KR0fpsS', 'nongdao', 'หญิง', '2004-09-08', 'dao@gmail.com', '0967895632');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expiry_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `token`, `email`, `created_at`, `expiry_date`) VALUES
(1, '0ac0004d4fc4003bb557053e9b595425432c4b3c27e5bb11fdafa975de4fab52', 'panttpa1@gmail.com', '2024-11-10 18:15:50', NULL),
(2, '1d4f8ade7358dfee20091919d92ba9579c5ca97e7d55f7da01a2e0d65dcd2c7b', 'panttpa1@gmail.com', '2024-11-10 18:24:36', NULL),
(3, '8b98380d49ea73bb6e1d44ebfa7fd48e64dac5a17c2fdf88fadcbb449395e2c9', 'panttpa1@gmail.com', '2024-11-10 18:26:21', NULL),
(4, '20f80967464851d000c60fb6f5b78b420380e8a955e7cc2b9652064cddf7e7c6', 'panttpa1@gmail.com', '2024-11-10 18:28:52', NULL),
(5, 'b6cd409c01c87d4780f126923b9932ccbe89375053680ce39ffd07263a2fb322', 'panttpa1@gmail.com', '2024-11-10 18:32:33', NULL),
(6, '500d75d2f55ceb4a59f8e12f5f0b3e8fa53657ff253f4f702e15af5f557b68da', 'panttpa1@gmail.com', '2024-11-10 18:35:39', '2024-11-12 01:35:39'),
(7, 'e78c5e6bf9f271982073db4d51caec99d2186a164d67627e78acd365e6250c6e', 'panttpa1@gmail.com', '2024-11-10 18:42:19', '2024-11-12 01:42:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `member`
--
ALTER TABLE `member`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
