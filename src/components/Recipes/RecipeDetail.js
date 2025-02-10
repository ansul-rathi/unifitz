import { useParams, Link } from "react-router-dom";
import recipes from "../../recipes.json";

const RecipeDetail = () => {
  const { id } = useParams();
  const recipe = recipes.find((r) => r.id === parseInt(id));

  if (!recipe) {
    return <p className="text-center text-xl mt-10 text-white">Recipe not found!</p>;
  }

  return (
    <div className="bg-black min-h-screen text-white py-12 px-6">
      <div className="max-w-3xl mx-auto text-center mt-10">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-96 object-cover rounded-lg shadow-lg"
        />
        <h2 className="text-4xl font-bold text-yellow-500 mt-6">{recipe.name}</h2>
        <p className="text-gray-400 mt-4">
          {recipe.calories} kcal | {recipe.protein}g Protein | {recipe.carbs}g Carbs | {recipe.fats}g Fats | {recipe.fiber}g Fiber
        </p>

        <h3 className="text-2xl font-semibold text-yellow-400 mt-6">Ingredients</h3>
        <ul className="list-disc text-left mx-auto mt-4 max-w-lg">
          {recipe.ingredients.map((item, index) => (
            <li key={index} className="text-gray-300">{item}</li>
          ))}
        </ul>

        <h3 className="text-2xl font-semibold text-yellow-400 mt-6">Instructions</h3>
        <ol className="list-decimal text-left mx-auto mt-4 max-w-lg">
          {recipe.instructions.map((step, index) => (
            <li key={index} className="text-gray-300">{step}</li>
          ))}
        </ol>

        <Link to="/recipes">
          <button className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg text-lg font-bold">
            Back to Recipes
          </button>
        </Link>
      </div>
    </div>
  );
};

export default RecipeDetail;
