package com.restaurant;

import java.util.*;
import java.time.LocalDateTime;

// Composition and Aggregation: Order HAS-A User and HAS-A List<MenuItem>
public class Order {
    private String orderId;
    private User customer; // Aggregation: Order has-a User
    private List<MenuItem> items; // Composition: Order has-a List of MenuItems
    private LocalDateTime orderTime;
    private String status;
    private double totalAmount;
    
    public Order(String orderId, User customer) {
        this.orderId = orderId;
        this.customer = customer;
        this.items = new ArrayList<>(); // Composition
        this.orderTime = LocalDateTime.now();
        this.status = "Pending";
        this.totalAmount = 0.0;
    }
    
    // Getters and Setters
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    
    public List<MenuItem> getItems() { return new ArrayList<>(items); } // Return copy
    
    public LocalDateTime getOrderTime() { return orderTime; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) {
        String[] validStatuses = {"Pending", "Preparing", "Ready", "Delivered", "Cancelled"};
        boolean isValid = false;
        for (String s : validStatuses) {
            if (s.equalsIgnoreCase(status)) {
                isValid = true;
                break;
            }
        }
        if (!isValid) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        this.status = status;
    }
    
    public double getTotalAmount() { return totalAmount; }
    
    // Method Overloading
    public void addItem(MenuItem item) {
        if (item == null) {
            throw new IllegalArgumentException("Cannot add null item");
        }
        items.add(item);
        calculateTotal();
    }
    
    public void addItem(MenuItem item, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }
        for (int i = 0; i < quantity; i++) {
            addItem(item);
        }
    }
    
    public void removeItem(MenuItem item) {
        items.remove(item);
        calculateTotal();
    }
    
    private void calculateTotal() {
        totalAmount = 0.0;
        for (MenuItem item : items) {
            totalAmount += item.getPrice();
        }
        // Apply tax
        double tax = RestaurantConfig.getInstance().getTaxRate();
        totalAmount += (totalAmount * tax / 100);
    }
    
    public int getItemCount() {
        return items.size();
    }
    
    @Override
    public String toString() {
        return String.format("Order[%s] - Customer: %s, Items: %d, Total: $%.2f, Status: %s",
                           orderId, customer.getName(), items.size(), totalAmount, status);
    }
}
