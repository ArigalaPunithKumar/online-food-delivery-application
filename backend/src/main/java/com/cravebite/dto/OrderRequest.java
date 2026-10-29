package com.cravebite.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderRequest(
    String customerName,
    String customerEmail,
    String customerPhone,
    String deliveryAddress,
    BigDecimal totalAmount,
    List<Item> items
) {
    public record Item(Long menuItemId, String menuItemName, Integer quantity, BigDecimal price) {}
}
