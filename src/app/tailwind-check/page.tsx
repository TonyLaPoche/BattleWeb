export default function TailwindCheckPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          ✅ Test Tailwind CSS
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Carte 1</h3>
            <p className="text-gray-600">Si vous voyez ceci stylisé, Tailwind fonctionne !</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-green-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Carte 2</h3>
            <p className="text-gray-600">Les styles sont appliqués correctement.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-500 rounded-full mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Carte 3</h3>
            <p className="text-gray-600">Tout fonctionne parfaitement !</p>
          </div>
        </div>

        <div className="mt-8 text-center">
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
