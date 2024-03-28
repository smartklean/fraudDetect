class TransactionEvent {
    constructor(timestamp, amount, userID, serviceID) {
        this.timestamp = timestamp;
        this.amount = amount;
        this.userID = userID;
        this.serviceID = serviceID;
    }
}

class FraudDetectionSystem {
    constructor() {
        this.userTransactions = new Map();
        this.userAvgAmounts = new Map();
    }

    processTransaction(event) {
        // Update user transaction history
        if (!this.userTransactions.has(event.userID)) {
            this.userTransactions.set(event.userID, new Map());
        }
        const userServices = this.userTransactions.get(event.userID);
        userServices.set(event.serviceID, (userServices.get(event.serviceID) || 0) + 1);

        // Calculate average amount for the user
        this.userAvgAmounts.set(event.userID, (this.userAvgAmounts.get(event.userID) || 0) + event.amount);

        // Check for fraudulent patterns
        this.checkForFraud(event);
    }

    checkForFraud(event) {
        const userServices = this.userTransactions.get(event.userID);
        const totalServices = [...userServices.values()].reduce((total, count) => total + count, 0);

        // Check for more than 3 distinct services within a 5-minute window
        if (totalServices > 3) {
            console.log(`User ${event.userID} has conducted transactions in more than 3 distinct services within a 5-minute window.`);
        }

        // Check for transactions 5x above the user's average amount in the last 24 hours
        const avgAmount = this.userAvgAmounts.get(event.userID) / totalServices;
        if (event.amount > avgAmount * 5) {
            console.log(`User ${event.userID} has made a transaction 5x above their average amount.`);
        }

        // Check for ping-pong activity within 10 minutes
        const currentTime = new Date().getTime();
        if (userServices.size > 1) {
            let prevService, prevTimestamp;
            for (const [service, timestamp] of userServices.entries()) {
                if (prevService && prevService !== service && (currentTime - prevTimestamp) <= 600000) {
                    console.log(`User ${event.userID} is engaged in ping-pong activity between ${prevService} and ${service} within 10 minutes.`);
                    break;
                }
                prevService = service;
                prevTimestamp = timestamp;
            }
        }
    }
}

// Test dataset
const testEvents = [
    new TransactionEvent(1617906000, 150.00, "user1", "serviceA"),
    new TransactionEvent(1617906060, 4500.00, "user2", "serviceB"),
    new TransactionEvent(1617906120, 75.00, "user1", "serviceC"),
    new TransactionEvent(1617906180, 3000.00, "user3", "serviceA"),
    new TransactionEvent(1617906240, 200.00, "user1", "serviceB"),
    new TransactionEvent(1617906300, 4800.00, "user2", "serviceC"),
    new TransactionEvent(1617906360, 100.00, "user4", "serviceA"),
    new TransactionEvent(1617906420, 4900.00, "user3", "serviceB"),
    new TransactionEvent(1617906480, 120.00, "user1", "serviceD"),
    new TransactionEvent(1617906540, 5000.00, "user3", "serviceC")
];

// Instantiate fraud detection system
const fraudDetectionSystem = new FraudDetectionSystem();

// Process test events
testEvents.forEach(event => {
    fraudDetectionSystem.processTransaction(event);
});