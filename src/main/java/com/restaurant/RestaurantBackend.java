package com.restaurant;

import java.io.*;
import java.net.*;
import java.util.*;
import com.sun.net.httpserver.*;

/**
 * Restaurant Backend System demonstrating OOP Principles:
 * 1. Encapsulation - Private fields with getters/setters in all classes
 * 2. Inheritance - MenuItem parent class with Appetizer, MainCourse, Dessert children
 * 3. Polymorphism - Method overriding (getItemType) and overloading (calculatePrice)
 * 4. Abstraction - Abstract MenuItem class and PaymentProcessor interface
 * 5. Design Patterns - Singleton (RestaurantConfig), Factory (MenuItemFactory), Observer (OrderManager)
 * 6. File Handling - Static file serving
 * 7. Exception Handling - Try-catch blocks and validation
 * 8. Collections - HashMap, ArrayList for data management
 * 9. Composition/Aggregation - Order has-a User, Order has-a List<MenuItem>
 */
public class RestaurantBackend {
    private static OrderManager orderManager = new OrderManager();
    private static Map<String, MenuItem> menuItems = new HashMap<>();
    private static int orderCounter = 1;
    
    static {
        // Initialize menu items using Factory Pattern
        initializeMenu();
        // Add observer
        orderManager.addObserver(new NotificationService());
    }
    
    // Initialize menu using Factory Pattern
    private static void initializeMenu() {
        // Demonstrating Polymorphism - all stored as MenuItem type
        menuItems.put("wings", MenuItemFactory.createMenuItem("appetizer", "wings", 
            "Buffalo Wings", 12.99, "Crispy chicken wings with buffalo sauce"));
        menuItems.put("steak", MenuItemFactory.createMenuItem("main", "steak", 
            "Grilled Ribeye Steak", 28.99, "Perfectly grilled 12oz ribeye"));
        menuItems.put("cheese", MenuItemFactory.createMenuItem("dessert", "cheese", 
            "New York Cheesecake", 7.99, "Classic creamy cheesecake"));
        menuItems.put("salad", MenuItemFactory.createMenuItem("appetizer", "salad", 
            "Caesar Salad", 9.99, "Fresh romaine with Caesar dressing"));
    }
    
    static class StaticHandler implements HttpHandler {
        private final String root;
        public StaticHandler(String root) { this.root = root; }
        @Override
        public void handle(HttpExchange e) throws IOException {
            String path = e.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";
            File file = new File(root + path);
            if (file.exists() && !file.isDirectory()) {
                String mime = path.endsWith(".html") ? "text/html" :
                              path.endsWith(".css") ? "text/css" :
                              path.endsWith(".js") ? "application/javascript" :
                              path.endsWith(".png") ? "image/png" :
                              path.endsWith(".jpg") ? "image/jpeg" : "application/octet-stream";
                e.getResponseHeaders().add("Content-Type", mime);
                e.sendResponseHeaders(200, file.length());
                try (OutputStream os = e.getResponseBody(); FileInputStream fis = new FileInputStream(file)) {
                    fis.transferTo(os);
                }
            } else {
                e.sendResponseHeaders(404, -1);
            }
        }
    }

    static class ClaimHandler implements HttpHandler {
        @Override public void handle(HttpExchange e) throws IOException {
            if ("POST".equals(e.getRequestMethod())) {
                String offerId = parse(e.getRequestURI().getQuery(), "offerId");
                String resp = "Offer " + (offerId != null ? offerId : "") + " claimed!";
                send(e, resp);
            } else e.sendResponseHeaders(405, -1);
        }
    }

    static class OrderHandler implements HttpHandler {
        @Override public void handle(HttpExchange e) throws IOException {
            if ("POST".equals(e.getRequestMethod())) {
                try {
                    String body = read(e);
                    // Parse order data
                    String itemId = parse(body, "itemId");
                    String userName = parse(body, "userName");
                    String userEmail = parse(body, "userEmail");
                    
                    // Data Validation
                    if (itemId == null || userName == null || userEmail == null) {
                        send(e, "Error: Missing required fields");
                        return;
                    }
                    
                    // Demonstrating OOP: Create User, Order, add MenuItem
                    User customer = new User("U" + orderCounter, userName, userEmail, "1234567890");
                    Order order = new Order("ORD" + orderCounter++, customer);
                    
                    // Get menu item (Polymorphism - could be any MenuItem subclass)
                    MenuItem item = menuItems.get(itemId);
                    if (item != null) {
                        order.addItem(item);
                        orderManager.addOrder(order); // Observer pattern notifies
                        
                        String response = String.format("Order created! %s - Total: $%.2f", 
                            order.getOrderId(), order.getTotalAmount());
                        send(e, response);
                    } else {
                        send(e, "Error: Item not found");
                    }
                } catch (IllegalArgumentException ex) {
                    // Exception Handling
                    send(e, "Error: " + ex.getMessage());
                }
            } else {
                e.sendResponseHeaders(405, -1);
            }
        }
    }

    static class CartHandler implements HttpHandler {
        private static final Map<String, Integer> cart = new HashMap<>();
        @Override
        public void handle(HttpExchange e) throws IOException {
            if ("GET".equals(e.getRequestMethod())) {
                send(e, "Cart: " + cart);
            } else if ("POST".equals(e.getRequestMethod())) {
                String body = read(e);
                String itemId = parse(body, "itemId");
                String action = parse(body, "action");
                if (itemId != null) {
                    if ("add".equals(action)) {
                        cart.put(itemId, cart.getOrDefault(itemId, 0) + 1);
                    } else if ("remove".equals(action)) {
                        cart.remove(itemId);
                    }
                }
                send(e, "Cart updated: " + cart);
            } else {
                e.sendResponseHeaders(405, -1);
            }
        }
    }

    private static void send(HttpExchange e, String resp) throws IOException {
        e.getResponseHeaders().add("Content-Type", "text/plain");
        e.sendResponseHeaders(200, resp.getBytes().length);
        e.getResponseBody().write(resp.getBytes());
        e.getResponseBody().close();
    }

    private static String read(HttpExchange e) throws IOException {
        try (var br = new BufferedReader(new InputStreamReader(e.getRequestBody()))) {
            return br.lines().collect(java.util.stream.Collectors.joining());
        }
    }

    private static String parse(String query, String key) {
        if (query == null) return null;
        for (String p : query.split("&")) {
            String[] kv = p.split("=");
            if (kv.length > 1 && kv[0].equals(key)) return kv[1];
        }
        return null;
    }

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/", new StaticHandler("./Public"));
        server.createContext("/api/claim", new ClaimHandler());
        server.createContext("/api/order", new OrderHandler());
        server.createContext("/api/cart", new CartHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Server running at http://localhost:8080");
    }
}
