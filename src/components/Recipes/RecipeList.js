import recipes from "../../recipes.json";
import RecipeCard from "./RecipeCard";

const RecipeList = () => {
  return (
    <div className="p-6 flex flex-wrap justify-center gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
};

export default RecipeList;
