package com.restaurant;

// Design Pattern: Singleton Pattern
public class RestaurantConfig {
    private static RestaurantConfig instance;
    private String restaurantName;
    private String address;
    private double taxRate;
    private int maxOrdersPerDay;
    
    // Private constructor for Singleton
    private RestaurantConfig() {
        this.restaurantName = "Savory Bites";
        this.address = "123 Food Street";
        this.taxRate = 8.5;
        this.maxOrdersPerDay = 100;
    }
    
    // Singleton getInstance method
    public static RestaurantConfig getInstance() {
        if (instance == null) {
            synchronized (RestaurantConfig.class) {
                if (instance == null) {
                    instance = new RestaurantConfig();
                }
            }
        }
        return instance;
    }
    
    // Getters and Setters
    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public double getTaxRate() { return taxRate; }
    public void setTaxRate(double taxRate) {
        if (taxRate < 0 || taxRate > 100) {
            throw new IllegalArgumentException("Tax rate must be between 0 and 100");
        }
        this.taxRate = taxRate;
    }
    
    public int getMaxOrdersPerDay() { return maxOrdersPerDay; }
    public void setMaxOrdersPerDay(int maxOrdersPerDay) { this.maxOrdersPerDay = maxOrdersPerDay; }
}
