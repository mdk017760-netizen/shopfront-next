import { Product } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    await addToCart(product._id);
    setIsLoading(false);
  };

  return (
    <Card className="group overflow-hidden bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <img 
          src={product.image || '/placeholder.svg'} 
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <Heart className="h-4 w-4" />
          </Button>
            {onViewDetails && (
              <Button 
                size="sm" 
                variant="secondary" 
                className="h-8 w-8 p-0"
                onClick={() => onViewDetails(product)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
        </div>

        {/* Stock badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Only {product.stock} left!
          </Badge>
        )}
        
        {product.stock === 0 && (
          <Badge variant="secondary" className="absolute top-2 left-2">
            Out of Stock
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <p className="text-lg font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            </div>

                  <Button 
                    size="sm" 
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isLoading}
                    className="bg-gradient-primary hover:opacity-90 shadow-button"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};