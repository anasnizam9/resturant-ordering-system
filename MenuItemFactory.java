// Design Pattern: Factory Pattern
public class MenuItemFactory {
    
    // Factory method to create different types of menu items
    public static MenuItem createMenuItem(String type, String id, String name, 
                                         double price, String description) {
        if (type == null || type.isEmpty()) {
            throw new IllegalArgumentException("Menu item type cannot be null or empty");
        }
        
        switch (type.toLowerCase()) {
            case "appetizer":
                return new Appetizer(id, name, price, description, "Small", true);
            case "maincourse":
            case "main":
                return new MainCourse(id, name, price, description, "25 mins", "Medium");
            case "dessert":
                return new Dessert(id, name, price, description, 350, false);
            default:
                throw new IllegalArgumentException("Unknown menu item type: " + type);
        }
    }
    
    // Overloaded factory method
    public static MenuItem createMenuItem(String type, String id, String name, double price) {
        return createMenuItem(type, id, name, price, "Delicious " + type);
    }
}
