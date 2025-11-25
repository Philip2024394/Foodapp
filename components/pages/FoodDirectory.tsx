import React from 'react';
import { Page, FoodType } from '../../types';
import { useNavigationContext } from '../../hooks/useNavigationContext';
import { useDataContext } from '../../hooks/useDataContext';

const FoodDirectory: React.FC = () => {
    const { navigateTo } = useNavigationContext();
    const { foodTypes } = useDataContext();

    const renderFoodType = (foodType: FoodType) => (
         <div key={foodType.id} className="flex flex-col md:flex-row items-start gap-6 bg-stone-800/60 backdrop-blur-lg border border-stone-700 p-6 rounded-2xl shadow-lg">
            <img src={foodType.imageUrl} alt={foodType.name} className="w-full md:w-48 h-48 object-cover rounded-lg flex-shrink-0" loading="lazy" />
            <div className="flex flex-col h-full">
                <h3 className="text-2xl font-bold text-stone-100">{foodType.name}</h3>
                <p className="mt-2 text-stone-300 flex-grow">{foodType.description}</p>
                 <button 
                    onClick={() => navigateTo(Page.FOOD)}
                    className="mt-4 bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300 self-start">
                    Find Vendors
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-12 pb-16">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-stone-100">IndoStreet Food Directory</h1>
                <p className="text-lg text-stone-400 max-w-3xl mx-auto mt-2">
                    A guide for tourists and locals alike to explore the rich and diverse world of Indonesian street food.
                </p>
            </div>

            {foodTypes.length > 0 ? (
                <section>
                    <div className="space-y-8">
                        {foodTypes.map(renderFoodType)}
                    </div>
                </section>
            ) : (
                 <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                    <h3 className="text-xl font-semibold text-stone-300">No Food Categories Found</h3>
                    <p className="text-stone-400 mt-2">There may be an issue fetching data, or no food types have been added yet.</p>
                </div>
            )}
        </div>
    );
};

export default FoodDirectory;