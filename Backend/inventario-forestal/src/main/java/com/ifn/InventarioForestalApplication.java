package com.ifn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class InventarioForestalApplication {

	public static void main(String[] args) {
		SpringApplication.run(InventarioForestalApplication.class, args);
	}

	@Bean
	public CommandLineRunner demo() {
		return args -> {
			System.out.println("🚀 =========================================");
			System.out.println("🚀 INVENTARIO FORESTAL - APLICACIÓN INICIADA");
			System.out.println("🚀 =========================================");
			System.out.println("✅ Spring Boot ejecutándose en puerto 8080");
			System.out.println("✅ Health check disponible en: http://localhost:8080/api/health");
			System.out.println("✅ Test endpoint: http://localhost:8080/api/test");
			System.out.println("🎯 ¡Listo para desarrollar!");
		};
	}
}