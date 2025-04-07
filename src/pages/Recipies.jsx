/* eslint-disable react/no-unescaped-entities */
import { Link } from "react-router-dom";
import recipes from "../recipes.json"; // Import your recipe data

const Recipes = () => {
  return (
    <div className="bg-black min-h-screen text-white py-12 px-6 ">
      <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-yellow-500 mb-10 text-center">
  ❤️✨ Special Recipes for This Valentine's Day 💕🍓
</h1>



      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            to={`/recipe/${recipe.id}`}
            className="bg-gray-900 p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300"
          >
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-64 object-cover rounded-md"
            />
            <h3 className="text-2xl font-semibold text-yellow-400 mt-4">
              {recipe.name}
            </h3>
            <p className="text-gray-400 text-lg mt-2">
              {recipe.calories} kcal | {recipe.protein}g Protein
            </p>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Recipes;
