const { getTrips } = require('api/data/trips.json');

//This function should return the data for drivers in the specified format

// Function to calculate total billed amount
function calculateTotalBilledAmount(trips) {
  return trips.reduce((total, trip) => total + trip.billed, 0);
}

// Function to filter cash trips
function filterCashTrips(trips) {
  return trips.filter((trip) => trip.isCash);
}

// Function to filter non-cash trips
function filterNonCashTrips(trips) {
  return trips.filter((trip) => !trip.isCash);
}

// Function to find the driver with the most trips
function findDriverWithMostTrips(drivers) {
  return drivers.reduce((maxDriver, driver) => {
    if (driver.noOfTrips > maxDriver.noOfTrips) {
      return driver;
    }
    return maxDriver;
  });
}

// Function to find the driver with the highest earnings
function findDriverWithHighestEarnings(drivers) {
  return drivers.reduce((maxDriver, driver) => {
    if (driver.totalAmountEarned > maxDriver.totalAmountEarned) {
      return driver;
    }
    return maxDriver;
  });
}

// Function to retrieve data for all trips
async function driverReport() {
  // Your code goes here

  const trips = await api.getTrips('api/data/trips.json');
  const noOfCashTrips = filterCashTrips(trips).length;
  const noOfNonCashTrips = filterNonCashTrips(trips).length;
  const billedTotal = calculateTotalBilledAmount(trips);
  const cashTrips = filterCashTrips(trips);
  const nonCashTrips = filterNonCashTrips(trips);
  const cashBilledTotal = calculateTotalBilledAmount(cashTrips);
  const nonCashBilledTotal = calculateTotalBilledAmount(nonCashTrips);

  // Retrieve driver data
  const drivers = await api.getDriver('api/data/drivers.json');

  const noOfDriversWithMoreThanOneVehicle = drivers.filter(
    (driver) => driver.noOfVehicles > 1
  ).length;
  const mostTripsByDriver = findDriverWithMostTrips(drivers);
  const highestEarningDriver = findDriverWithHighestEarnings(drivers);

  const result = {
    noOfCashTrips,
    noOfNonCashTrips,
    billedTotal,
    cashBilledTotal,
    nonCashBilledTotal,
    noOfDriversWithMoreThanOneVehicle,
    mostTripsByDriver,
    highestEarningDriver,
  };

  return result;
}

// Function to retrieve data for every driver on the platform
async function getDriverData() {
  const drivers = await api.getDriver('api/data/drivers.json');

  const result = [];

  for (const driver of drivers) {
    const trips = await api.getTripsByDriver(driver.id);

    const driverData = {
      fullName: driver.fullName,
      id: driver.id,
      phone: driver.phone,
      noOfTrips: driver.noOfTrips,
      noOfVehicles: driver.noOfVehicles,
      vehicles: driver.vehicles,
      noOfCashTrips: filterCashTrips(trips).length,
      noOfNonCashTrips: filterNonCashTrips(trips).length,
      totalAmountEarned: calculateTotalBilledAmount(trips),
      totalCashAmount: calculateTotalBilledAmount(filterCashTrips(trips)),
      totalNonCashAmount: calculateTotalBilledAmount(filterNonCashTrips(trips)),
      trips,
    };

    result.push(driverData);
  }

  return result;
}

module.exports = driverReport;
