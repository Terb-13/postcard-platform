      {/* Simple Production Timeline */}
      {inProduction.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Production Timeline</h2>
          <div className="flex items-center justify-between max-w-md">
            {["Paid", "In Production", "Shipped", "Delivered"].map((step, index) => {
              const isActive = index < 2; // simplistic for demo
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${isActive ? "bg-blue-600" : "bg-gray-300"}`} />
                  <div className={`mt-1 text-xs ${isActive ? "text-blue-600" : "text-gray-500"}`}>{step}</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">(Timeline will be more accurate in a future update)</p>
        </section>
      )}
