package com.cravebite.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * No startup seeding: menu catalogues and order data must be managed through
 * the application's real administrative workflow and persisted database.
 */
@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner validateDatabase() {
        return args -> {
            // Spring Data JPA validates connectivity at application startup.
            // Do not insert synthetic menu items or orders into a real database.
        };
    }
}
