// Inheritance: Appetizer extends MenuItem
public class Appetizer extends MenuItem {
    private String servingSize;
    private boolean isVegetarian;
    
    public Appetizer(String id, String name, double price, String description, 
                     String servingSize, boolean isVegetarian) {
        super(id, name, price, "Appetizer", description);
        this.servingSize = servingSize;
        this.isVegetarian = isVegetarian;
    }
    
    public String getServingSize() { return servingSize; }
    public void setServingSize(String servingSize) { this.servingSize = servingSize; }
    
    public boolean isVegetarian() { return isVegetarian; }
    public void setVegetarian(boolean vegetarian) { isVegetarian = vegetarian; }
    
    // Polymorphism: Method Overriding
    @Override
    public String getItemType() {
        return "Appetizer";
    }
    
    @Override
    public String toString() {
        return super.toString() + (isVegetarian ? " [Vegetarian]" : "");
    }
}
