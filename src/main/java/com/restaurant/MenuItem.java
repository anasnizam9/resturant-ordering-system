package com.restaurant;

// Abstract class demonstrating Abstraction
public abstract class MenuItem {
    // Encapsulation: Private fields with getters/setters
    private String id;
    private String name;
    private double price;
    private String category;
    private String description;
    
    // Constructor
    public MenuItem(String id, String name, double price, String category, String description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.description = description;
    }
    
    // Getters and Setters (Encapsulation)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public double getPrice() { return price; }
    public void setPrice(double price) {
        // Data Validation
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        this.price = price;
    }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    // Abstract method (Abstraction)
    public abstract String getItemType();
    
    // Polymorphism: Method Overloading
    public double calculatePrice() {
        return this.price;
    }
    
    public double calculatePrice(double discount) {
        // Data Validation
        if (discount < 0 || discount > 100) {
            throw new IllegalArgumentException("Discount must be between 0 and 100");
        }
        return this.price - (this.price * discount / 100);
    }
    
    public double calculatePrice(double discount, double tax) {
        double discountedPrice = calculatePrice(discount);
        return discountedPrice + (discountedPrice * tax / 100);
    }
    
    @Override
    public String toString() {
        return String.format("%s: %s - $%.2f (%s)", getItemType(), name, price, category);
    }
}
