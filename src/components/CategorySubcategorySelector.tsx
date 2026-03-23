import { Category, Subcategory } from '../types/quote.types';

interface CategorySubcategorySelectorProps {
  categories: Category[];
  selectedCategory: Category | null;
  subcategories: Subcategory[];
  selectedSubcategory: Subcategory | null;
  onCategorySelect: (category: Category | null) => void;
  onSubcategorySelect: (subcategory: Subcategory | null) => void;
}

export function CategorySubcategorySelector({
  categories,
  selectedCategory,
  subcategories,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect
}: CategorySubcategorySelectorProps) {
  return (
    <>
      <div className="border-b border-neutral-800 bg-black">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-wrap gap-8 justify-center">
            <button
              onClick={() => onCategorySelect(null)}
              className={`relative px-2 py-3 text-sm font-medium tracking-wide transition-all duration-300 ${
                selectedCategory === null
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Toutes les catégories
              {selectedCategory === null && (
                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
              )}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category)}
                className={`relative px-2 py-3 text-sm font-medium tracking-wide transition-all duration-300 ${
                  selectedCategory?.id === category.id
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {category.name}
                {selectedCategory?.id === category.id && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedCategory && subcategories.length > 0 && (
        <div className="border-b border-neutral-800 bg-black">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-wrap gap-8 justify-center">
              <button
                onClick={() => onSubcategorySelect(null)}
                className={`relative px-2 py-3 text-sm font-medium tracking-wide transition-all duration-300 ${
                  selectedSubcategory === null
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Toutes les sous-catégories
                {selectedSubcategory === null && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                )}
              </button>
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => onSubcategorySelect(subcategory)}
                  className={`relative px-2 py-3 text-sm font-medium tracking-wide transition-all duration-300 ${
                    selectedSubcategory?.id === subcategory.id
                      ? 'text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {subcategory.subcategory}
                  {selectedSubcategory?.id === subcategory.id && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
