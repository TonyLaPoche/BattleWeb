export default function TailwindTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎨 Test Tailwind CSS
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 bg-blue-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Titre 1</h3>
            <p className="text-gray-600">Description avec du texte stylisé avec Tailwind CSS.</p>
            <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Bouton
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 bg-green-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Titre 2</h3>
            <p className="text-gray-600">Une autre carte avec des styles différents.</p>
            <button className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
              Action
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="w-12 h-12 bg-purple-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Titre 3</h3>
            <p className="text-gray-600">Test des couleurs et des effets hover.</p>
            <button className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
              Cliquez
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block bg-white text-gray-800 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow font-semibold"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
