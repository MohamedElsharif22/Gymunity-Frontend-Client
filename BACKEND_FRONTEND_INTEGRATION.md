// FRONTEND - BACKEND PAYPAL INTEGRATION GUIDE
// Based on your updated PayPalReturn endpoint implementation

/**
 * ============================================================================
 * COMPLETE PAYPAL PAYMENT FLOW WITH YOUR BACKEND IMPLEMENTATION
 * ============================================================================
 */

/**
 * BACKEND ENDPOINT: GET /api/payment/paypal/return?token=PAYPAL_TOKEN
 * 
 * Your implementation handles:
 * 1. ✅ Find Payment record by PayPal token
 * 2. ✅ Check if already completed (prevent double capture)
 * 3. ✅ Get order status from PayPal using token
 * 4. ✅ Check if PayPal already captured
 * 5. ✅ If not captured, capture manually
 * 6. ✅ Confirm payment in database
 * 7. ✅ Redirect to: /payment/success?subscriptionId={id}
 * 8. ✅ Handle all errors and redirect to /payment/failed
 */

/**
 * ============================================================================
 * FRONTEND FLOW
 * ============================================================================
 */

// 1️⃣ PAYMENT INITIATION PAGE
// File: src/app/features/payments/components/payment/payment.component.ts

export class PaymentComponent implements OnInit {
  // User selects PayPal and clicks "Pay with PayPal"
  proceedToPayment() {
    // Calls backend: POST /api/client/payments/initiate
    // Backend returns: { paymentUrl: "https://paypal.com/checkoutsession/..." }
    // Frontend redirects user to PayPal

    this.paymentService.initiatePayment({
      subscriptionId: this.subscriptionId,
      paymentMethod: 'PayPal'
      // No returnUrl needed - backend PayPalService handles it
    }).subscribe({
      next: (response: any) => {
        // Get PayPal approval URL
        const paymentUrl = response.data?.paymentUrl || response.paymentUrl;
        
        // Redirect to PayPal
        window.location.href = paymentUrl;
        
        // User approves payment on PayPal
        // PayPal redirects to: /api/payment/paypal/return?token=EC-...
      }
    });
  }
}

// 2️⃣ PAYPAL CALLBACK FLOW (Backend handles)
/*
 * Flow:
 * 1. User clicks "Approve" on PayPal
 * 2. PayPal redirects to: /api/payment/paypal/return?token=EC-1234567890
 * 3. Backend PayPalReturnController processes:
 *
 *    a) Find Payment by token:
 *       SELECT * FROM Payments WHERE GatewayOrderId = "EC-1234567890"
 *
 *    b) Check if already completed:
 *       IF payment.Status == Completed → redirect to success
 *       (handles double-click or refresh scenarios)
 *
 *    c) Get PayPal order status:
 *       Call PayPal GetOrderAsync(token)
 *       Returns order details including capture status
 *
 *    d) Check if already captured:
 *       IF order.PurchaseUnits[0].Captures exist and status = COMPLETED
 *       → Use existing capture ID
 *       ELSE
 *       → Call PayPal CaptureOrderAsync(token)
 *
 *    e) Confirm payment:
 *       Update Payment record with:
 *       - Status = Completed
 *       - CaptureId = PayPal capture ID
 *       - PaidAt = DateTime.Now
 *
 *    f) Redirect to success:
 *       return Redirect("/payment/success?subscriptionId=123")
 *
 * Error handling:
 *   - Payment not found → /payment/error
 *   - Order not found → /payment/failed
 *   - Capture failed → /payment/failed
 *   - Any exception → /payment/failed
 */

// 3️⃣ SUCCESS PAGE
// File: src/app/features/payments/components/payment-success/payment-success.component.ts

export class PaymentSuccessComponent implements OnInit {
  ngOnInit() {
    // Backend redirects with query param
    this.route.queryParams.subscribe(params => {
      const subscriptionId = params['subscriptionId']; // From backend redirect
      
      if (subscriptionId) {
        // Load subscription details to display confirmation
        this.loadSubscription(parseInt(subscriptionId, 10));
      } else {
        // Fallback to session storage if available
        const sessionSubId = sessionStorage.getItem('subscriptionId');
        if (sessionSubId) {
          this.loadSubscription(parseInt(sessionSubId, 10));
        } else {
          this.error.set(true);
        }
      }
    });
  }

  private loadSubscription(subscriptionId: number) {
    // Call: GET /api/client/subscriptions/{subscriptionId}
    this.subscriptionService.getSubscriptionById(subscriptionId).subscribe({
      next: (response: any) => {
        // Display subscription confirmation
        // Shows: Package name, trainer, dates, amount paid, status
        this.subscription.set(response.data);
      },
      error: (err: any) => {
        // Fallback to session storage data if API fails
        const sessionData = sessionStorage.getItem('subscriptionData');
        if (sessionData) {
          this.subscription.set(JSON.parse(sessionData));
        } else {
          this.error.set(true);
        }
      }
    });
  }
}

/**
 * ============================================================================
 * PAYMENT OUTCOMES & FRONTEND PAGES
 * ============================================================================
 */

// ✅ SUCCESS PATH: /payment/success?subscriptionId={id}
// Route: GET /api/payment/paypal/return?token=... → Backend redirect
// Display: Subscription confirmation, activation status, next steps

// ❌ FAILED PATH: /payment/failed
// Trigger: CaptureOrderAsync failed, capture error, order not found
// Display: Error message, "Try Again" button, contact support link

// ⚠️  CANCELED PATH: /payment/canceled
// Trigger: User clicked "Cancel" on PayPal
// Display: "Payment Canceled" message, no charges, can retry

// ⚠️  ERROR PATH: /payment/error
// Trigger: Unexpected backend error, payment not found
// Display: "Unexpected Error" message, contact support

/**
 * ============================================================================
 * KEY IMPLEMENTATION DETAILS
 * ============================================================================
 */

// 1. NO RETURN URL PARAMETER NEEDED
//    - Backend PayPalService configures callback URLs
//    - Frontend just redirects to PayPal
//    - PayPal calls backend endpoint directly

// 2. DOUBLE CAPTURE PREVENTION
//    - Backend checks if payment already completed
//    - Prevents duplicate captures if user refreshes
//    - Always safe to retry

// 3. FLEXIBLE CAPTURE HANDLING
//    - Backend checks PayPal order status first
//    - Uses existing capture if available
//    - Only captures if needed
//    - Handles edge cases gracefully

// 4. SUBSCRIPTION ACTIVATION
//    - Triggered when Payment.Status = Completed
//    - Subscription becomes active immediately
//    - User can access training programs
//    - Trainer is notified

// 5. ERROR RESILIENCE
//    - Frontend uses session storage fallback
//    - Shows success even if data API fails
//    - Multiple response format support
//    - Graceful error handling

/**
 * ============================================================================
 * PAYMENT STATUS FLOW
 * ============================================================================
 */

/*
 * Database Status Progression:
 *
 * 1. PENDING
 *    ├─ Payment record created
 *    ├─ GatewayOrderId set to PayPal token
 *    └─ Awaiting user PayPal approval
 *
 * 2. PROCESSING (during capture)
 *    ├─ User approved on PayPal
 *    ├─ Backend capturing order
 *    └─ Call to CaptureOrderAsync in progress
 *
 * 3. COMPLETED ✅
 *    ├─ CaptureId stored
 *    ├─ PaidAt timestamp set
 *    ├─ Subscription activated
 *    └─ Frontend redirected to success page
 *
 * 4. FAILED ❌
 *    ├─ Capture failed
 *    ├─ FailureReason stored
 *    ├─ Subscription stays inactive
 *    └─ Frontend redirected to failed page
 */

/**
 * ============================================================================
 * TESTING CHECKLIST
 * ============================================================================
 */

/*
 * ✅ Happy Path:
 *   1. User subscribes to package
 *   2. Clicks "Pay with PayPal"
 *   3. Redirected to PayPal sandbox
 *   4. Approves payment
 *   5. Redirected to /payment/success?subscriptionId=X
 *   6. Success page loads subscription details
 *   7. User can access dashboard
 *
 * ✅ Double-Click Prevention:
 *   1. User approves, backend processing
 *   2. User clicks back and approves again (or refreshes)
 *   3. Backend checks if already completed
 *   4. Returns success without duplicate capture
 *
 * ✅ Capture Already Exists:
 *   1. PayPal somehow already captured
 *   2. Backend GetOrderAsync finds existing capture
 *   3. Uses that capture instead of creating new one
 *   4. Payment confirmed successfully
 *
 * ✅ Capture Failure:
 *   1. CaptureOrderAsync returns error
 *   2. Payment marked as failed
 *   3. Frontend redirected to /payment/failed
 *   4. Subscription stays inactive
 *
 * ✅ User Cancels:
 *   1. User clicks "Cancel" on PayPal
 *   2. PayPal redirects to /api/payment/paypal/cancel
 *   3. Backend marks payment as failed
 *   4. Frontend redirected to /payment/canceled
 *
 * ✅ Backend Error:
 *   1. Payment not found OR unexpected error
 *   2. Frontend redirected to /payment/error
 *   3. User can contact support
 */

/**
 * ============================================================================
 * INTEGRATION WITH YOUR BACKEND
 * ============================================================================
 */

// Your implementation correctly handles:
// ✅ Multiple capture attempts
// ✅ Idempotent payment confirmation
// ✅ PayPal order status validation
// ✅ Comprehensive error logging
// ✅ Frontend redirect with subscriptionId
// ✅ Graceful error handling

// Frontend implementation supports:
// ✅ Query param extraction from backend redirect
// ✅ Session storage fallback
// ✅ Multiple response format handling
// ✅ Error pages for all outcomes
// ✅ User-friendly error messages
// ✅ Loading states and error states

