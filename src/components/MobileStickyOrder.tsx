import OrderBottomSheet from "./OrderBottomSheet";

/**
 * Bottom sticky CTA button for mobile devices
 * Fixed at bottom with safe-area padding for iOS
 * Hidden on desktop (md+)
 */
const MobileStickyOrder = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Gradient fade above button */}
      <div className="h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      
      {/* Button container with safe-area padding */}
      <div 
        className="bg-background/95 backdrop-blur-md border-t border-border px-4 py-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <OrderBottomSheet>
          <button className="btn-order w-full text-base py-4 touch-target">
            🍔 COMMANDER MAINTENANT
          </button>
        </OrderBottomSheet>
      </div>
    </div>
  );
};

export default MobileStickyOrder;
