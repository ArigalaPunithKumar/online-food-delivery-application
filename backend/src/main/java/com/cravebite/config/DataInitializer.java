package com.cravebite.config;

import com.cravebite.entity.MenuItem;
import com.cravebite.repository.MenuItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedMenu(MenuItemRepository repo) {
        return args -> {
            // Upsert this demo menu without deleting existing database records.
            List<MenuItem> seedItems = List.of(
                item("Benne Masala Dosa", "Legendary crispy, thick dosa roasted in rich butter with spicy potato filling.", "breakfast", "85.00", "/images/dosa.svg", "Vidyarthi Bhavan"),
                item("Meghana Special Biryani", "Aromatic basmati rice cooked with tender chicken and secret spices.", "biryani", "320.00", "/images/biryani.svg", "Meghana Foods"),
                item("Butter Masala Dosa", "Crisp dosa served with signature coconut chutney and sambar.", "breakfast", "75.00", "/images/dosa.svg", "CTR"),
                item("Mutton Ghee Roast", "Spicy and tangy Mangalorean style mutton roasted in pure ghee.", "curries", "380.00", "/images/biryani.svg", "Empire Restaurant"),
                item("Idli Vada Sambar Dip", "Soft idlis and crispy vada submerged in flavorful lentil sambar.", "breakfast", "90.00", "/images/idli.svg", "MTR"),
                item("Chicken Kabab", "Crispy, deep-fried chicken marinated in a blend of South Indian spices.", "snacks", "210.00", "/images/biryani.svg", "Empire Restaurant"),
                item("Paneer Butter Masala", "Rich and creamy curry made with fresh cottage cheese.", "curries", "240.00", "/images/dosa.svg", "Meghana Foods"),
                item("Gobi Manchurian", "Indo-Chinese style crispy cauliflower tossed in a spicy sauce.", "snacks", "150.00", "/images/idli.svg", "Empire Restaurant"),
                item("Andhra Chicken Meal", "Spicy Andhra style chicken served with rice, pappu, and rasam.", "biryani", "290.00", "/images/biryani.svg", "Nagarjuna"),
                item("Death By Chocolate", "Iconic dessert with vanilla ice cream, chocolate sponge, peanuts and hot fudge.", "dessert", "260.00", "/images/dessert.svg", "Corner House")
            );

            for (MenuItem seed : seedItems) {
                MenuItem menu = repo.findByName(seed.getName()).orElseGet(MenuItem::new);
                menu.setName(seed.getName());
                menu.setDescription(seed.getDescription());
                menu.setCategory(seed.getCategory());
                menu.setPrice(seed.getPrice());
                menu.setImageUrl(seed.getImageUrl());
                menu.setRestaurantName(seed.getRestaurantName());
                menu.setAvailable(true);
                repo.save(menu);
            }
        };
    }

    private MenuItem item(String name, String description, String category, String price, String image, String restaurant) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setDescription(description);
        item.setCategory(category);
        item.setPrice(new BigDecimal(price));
        item.setImageUrl(image);
        item.setRestaurantName(restaurant);
        item.setAvailable(true);
        return item;
    }
}
