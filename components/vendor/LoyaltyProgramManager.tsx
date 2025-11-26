import React, { useState, useMemo } from 'react';
import { Vendor, MenuItem, LoyaltyRewardTier } from '../../types';
import { PlusIcon, TrashIcon, GiftIcon, PercentIcon, StarIcon, ToggleIcon } from '../common/Icon';
import ToggleSwitch from '../common/ToggleSwitch';
import Modal from '../common/Modal';

interface LoyaltyProgramManagerProps {
  vendor: Vendor;
  menuItems: MenuItem[];
  onSave: (loyaltyConfig: Vendor['loyaltyProgram']) => void;
}

const LoyaltyProgramManager: React.FC<LoyaltyProgramManagerProps> = ({ vendor, menuItems, onSave }) => {
  const [isActive, setIsActive] = useState(vendor.loyaltyProgram?.isActive || false);
  const [pointsPerOrder, setPointsPerOrder] = useState(vendor.loyaltyProgram?.pointsPerOrder || 1);
  const [rewardTiers, setRewardTiers] = useState<LoyaltyRewardTier[]>(vendor.loyaltyProgram?.rewardTiers || []);
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyRewardTier | null>(null);

  // Form state for new/editing tier
  const [tierForm, setTierForm] = useState({
    pointsRequired: 5,
    rewardType: 'discount' as 'discount' | 'free_item',
    discountPercentage: 10,
    freeItemId: '',
    description: '',
    validityDays: 30
  });

  const handleSave = () => {
    const config = {
      isActive,
      pointsPerOrder,
      rewardTiers: rewardTiers.sort((a, b) => a.pointsRequired - b.pointsRequired)
    };
    onSave(config);
  };

  const handleAddTier = () => {
    if (!tierForm.description.trim()) {
      alert('Please add a description for the reward');
      return;
    }

    const freeItem = tierForm.rewardType === 'free_item' && tierForm.freeItemId
      ? menuItems.find(item => item.id === tierForm.freeItemId)
      : null;

    const newTier: LoyaltyRewardTier = {
      id: `tier_${Date.now()}`,
      pointsRequired: tierForm.pointsRequired,
      rewardType: tierForm.rewardType,
      discountPercentage: tierForm.rewardType === 'discount' ? tierForm.discountPercentage : undefined,
      freeItemId: tierForm.rewardType === 'free_item' ? tierForm.freeItemId : undefined,
      freeItemName: freeItem?.name,
      description: tierForm.description || 
        (tierForm.rewardType === 'discount' 
          ? `${tierForm.discountPercentage}% off next order`
          : `Free ${freeItem?.name}`),
      validityDays: tierForm.validityDays
    };

    if (editingTier) {
      setRewardTiers(prev => prev.map(t => t.id === editingTier.id ? { ...newTier, id: editingTier.id } : t));
      setEditingTier(null);
    } else {
      setRewardTiers(prev => [...prev, newTier]);
    }

    setShowAddTierModal(false);
    resetTierForm();
  };

  const resetTierForm = () => {
    setTierForm({
      pointsRequired: 5,
      rewardType: 'discount',
      discountPercentage: 10,
      freeItemId: '',
      description: '',
      validityDays: 30
    });
  };

  const handleEditTier = (tier: LoyaltyRewardTier) => {
    setEditingTier(tier);
    setTierForm({
      pointsRequired: tier.pointsRequired,
      rewardType: tier.rewardType,
      discountPercentage: tier.discountPercentage || 10,
      freeItemId: tier.freeItemId || '',
      description: tier.description,
      validityDays: tier.validityDays || 30
    });
    setShowAddTierModal(true);
  };

  const handleDeleteTier = (tierId: string) => {
    if (confirm('Are you sure you want to delete this reward tier?')) {
      setRewardTiers(prev => prev.filter(t => t.id !== tierId));
    }
  };

  const availableMenuItems = useMemo(() => menuItems.filter(item => item.isAvailable), [menuItems]);

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600 rounded-xl">
            <GiftIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Loyalty Program</h2>
            <p className="text-sm text-gray-600">Reward your repeat customers</p>
          </div>
        </div>
        <ToggleSwitch
          enabled={isActive}
          onChange={setIsActive}
          label=""
        />
      </div>

      {/* Points Configuration */}
      <div className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-purple-100">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Points Per Order
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Customers earn this many points for each completed order in a month
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPointsPerOrder(Math.max(1, pointsPerOrder - 1))}
            className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold hover:bg-purple-200 transition"
          >
            -
          </button>
          <div className="flex-1 text-center">
            <div className="text-3xl font-bold text-purple-600">{pointsPerOrder}</div>
            <div className="text-xs text-gray-500">point{pointsPerOrder !== 1 ? 's' : ''} / order</div>
          </div>
          <button
            onClick={() => setPointsPerOrder(pointsPerOrder + 1)}
            className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold hover:bg-purple-200 transition"
          >
            +
          </button>
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Reward Tiers</h3>
          <button
            onClick={() => {
              resetTierForm();
              setEditingTier(null);
              setShowAddTierModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
          >
            <PlusIcon className="h-4 w-4" />
            Add Tier
          </button>
        </div>

        {rewardTiers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <GiftIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No reward tiers yet. Add your first reward!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewardTiers.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-lg border-2 border-purple-300">
                    <StarIcon className="h-6 w-6 text-purple-600 mb-1" />
                    <div className="text-xl font-bold text-purple-600">{tier.pointsRequired}</div>
                    <div className="text-[10px] text-gray-500">points</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {tier.rewardType === 'discount' ? (
                        <div className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs font-bold">
                          {tier.discountPercentage}% OFF
                        </div>
                      ) : (
                        <div className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">
                          FREE ITEM
                        </div>
                      )}
                      <span className="text-xs text-gray-500">Valid {tier.validityDays} days</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{tier.description}</p>
                    {tier.freeItemName && (
                      <p className="text-xs text-gray-500 mt-1">Item: {tier.freeItemName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditTier(tier)}
                    className="px-3 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition text-sm font-semibold border border-purple-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
      >
        Save Loyalty Program
      </button>

      {/* Add/Edit Tier Modal */}
      {showAddTierModal && (
        <Modal
          title={editingTier ? 'Edit Reward Tier' : 'Add Reward Tier'}
          isOpen={showAddTierModal}
          onClose={() => {
            setShowAddTierModal(false);
            setEditingTier(null);
            resetTierForm();
          }}
        >
          <div className="space-y-4">
            {/* Points Required */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Points Required
              </label>
              <input
                type="number"
                min="1"
                value={tierForm.pointsRequired}
                onChange={(e) => setTierForm(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Reward Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reward Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTierForm(prev => ({ ...prev, rewardType: 'discount' }))}
                  className={`py-3 rounded-lg font-semibold transition ${
                    tierForm.rewardType === 'discount'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <PercentIcon className="h-5 w-5 mx-auto mb-1" />
                  Discount
                </button>
                <button
                  onClick={() => setTierForm(prev => ({ ...prev, rewardType: 'free_item' }))}
                  className={`py-3 rounded-lg font-semibold transition ${
                    tierForm.rewardType === 'free_item'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <GiftIcon className="h-5 w-5 mx-auto mb-1" />
                  Free Item
                </button>
              </div>
            </div>

            {/* Conditional Fields */}
            {tierForm.rewardType === 'discount' ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tierForm.discountPercentage}
                    onChange={(e) => setTierForm(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) || 10 }))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-600 font-semibold">%</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Free Menu Item
                </label>
                <select
                  value={tierForm.freeItemId}
                  onChange={(e) => setTierForm(prev => ({ ...prev, freeItemId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select an item</option>
                  {availableMenuItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Rp {item.price.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={tierForm.description}
                onChange={(e) => setTierForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder={tierForm.rewardType === 'discount' 
                  ? `${tierForm.discountPercentage}% off next order`
                  : 'Free item with next order'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Validity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Validity Period (days)
              </label>
              <input
                type="number"
                min="1"
                value={tierForm.validityDays}
                onChange={(e) => setTierForm(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 30 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowAddTierModal(false);
                  setEditingTier(null);
                  resetTierForm();
                }}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTier}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                {editingTier ? 'Update' : 'Add'} Tier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LoyaltyProgramManager;
