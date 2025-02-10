import { Link } from "react-router-dom";

const RecipeCard = ({ recipe }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full sm:w-[300px]">
      <div className="w-full h-full overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-bold">{recipe.name}</h3>
        <p className="text-gray-600">{recipe.calories} kcal | {recipe.protein}g Protein</p>
        <Link to={`/recipe/${recipe.id}`}>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

export default RecipeCard;
