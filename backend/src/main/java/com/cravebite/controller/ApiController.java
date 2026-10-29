package com.cravebite.controller;

import com.cravebite.dto.OrderRequest;
import com.cravebite.entity.MenuItem;
import com.cravebite.entity.Order;
import com.cravebite.entity.OrderItem;
import com.cravebite.repository.MenuItemRepository;
import com.cravebite.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("40.00");

    private final MenuItemRepository menuItemRepository;
    private final OrderRepository orderRepository;

    public ApiController(MenuItemRepository menuItemRepository, OrderRepository orderRepository) {
        this.menuItemRepository = menuItemRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/menu")
    public List<MenuItem> menu() {
        return menuItemRepository.findByAvailableTrue();
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        if (request == null
                || request.customerName() == null
                || request.customerName().isBlank()
                || request.deliveryAddress() == null
                || request.deliveryAddress().isBlank()
                || request.items() == null
                || request.items().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Customer name, delivery address and at least one item are required.");
        }

        Order order = new Order();
        order.setCustomerName(request.customerName().trim());
        order.setCustomerEmail(request.customerEmail());
        order.setCustomerPhone(request.customerPhone());
        order.setDeliveryAddress(request.deliveryAddress().trim());

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderRequest.Item item : request.items()) {
            if (item == null || item.quantity() == null || item.quantity() < 1) {
                return ResponseEntity.badRequest().body("Each item must have a positive quantity.");
            }

            Optional<MenuItem> menuResult;
            if (item.menuItemName() != null && !item.menuItemName().isBlank()) {
                menuResult = menuItemRepository.findByName(item.menuItemName().trim());
            } else if (item.menuItemId() != null) {
                menuResult = menuItemRepository.findById(item.menuItemId());
            } else {
                return ResponseEntity.badRequest().body("Each item must include a menu item name.");
            }

            if (menuResult.isEmpty() || !Boolean.TRUE.equals(menuResult.get().getAvailable())) {
                return ResponseEntity.badRequest().body("One or more selected menu items are unavailable.");
            }

            MenuItem menuItem = menuResult.get();
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(item.quantity());
            // Never trust the browser to decide item prices.
            orderItem.setPrice(menuItem.getPrice());
            order.addItem(orderItem);

            subtotal = subtotal.add(menuItem.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
        }

        // Keep the server-side total consistent with the UI's delivery fee.
        order.setTotalAmount(subtotal.add(DELIVERY_FEE));
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(Map.of("orderId", saved.getId(), "status", saved.getStatus()));
    }
}
