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
        if (request == null || request.customerName() == null || request.customerName().isBlank()
                || request.customerPhone() == null || request.customerPhone().isBlank()
                || request.deliveryAddress() == null || request.deliveryAddress().isBlank()
                || request.items() == null || request.items().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "Name, phone, delivery address, and at least one item are required."));
        }
        Order order = new Order();
        order.setCustomerName(request.customerName().trim());
        order.setCustomerEmail(request.customerEmail());
        order.setCustomerPhone(request.customerPhone().trim());
        order.setDeliveryAddress(request.deliveryAddress().trim());
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderRequest.Item item : request.items()) {
            if (item == null || item.quantity() == null || item.quantity() < 1) {
                return ResponseEntity.badRequest().body(Map.of("message", "Each item requires a positive quantity."));
            }
            Optional<MenuItem> found = item.menuItemId() != null
                    ? menuItemRepository.findById(item.menuItemId())
                    : (item.menuItemName() != null ? menuItemRepository.findByName(item.menuItemName().trim()) : Optional.empty());
            if (found.isEmpty() || !Boolean.TRUE.equals(found.get().getAvailable())) {
                return ResponseEntity.badRequest().body(Map.of("message", "A selected menu item is unavailable."));
            }
            MenuItem menuItem = found.get();
            OrderItem line = new OrderItem();
            line.setMenuItem(menuItem);
            line.setQuantity(item.quantity());
            line.setPrice(menuItem.getPrice());
            order.addItem(line);
            subtotal = subtotal.add(menuItem.getPrice().multiply(BigDecimal.valueOf(item.quantity())));
        }
        order.setTotalAmount(subtotal.add(DELIVERY_FEE));
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(Map.of("orderId", saved.getId(), "status", saved.getStatus()));
    }

}
