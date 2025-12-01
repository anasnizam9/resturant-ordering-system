package com.restaurant;

// Implementation of custom interface
public class CreditCardPayment implements PaymentProcessor {
    private String cardNumber;
    private String cardHolder;
    
    public CreditCardPayment(String cardNumber, String cardHolder) {
        this.cardNumber = cardNumber;
        this.cardHolder = cardHolder;
    }
    
    @Override
    public boolean processPayment(double amount) {
        // Data Validation
        if (amount <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
        System.out.println("Processing credit card payment of $" + amount);
        return true;
    }
    
    @Override
    public String getPaymentMethod() {
        return "Credit Card";
    }
    
    @Override
    public boolean refund(double amount) {
        System.out.println("Refunding $" + amount + " to credit card");
        return true;
    }
}
