const { getTrips } = require('api/data/trips.json');
// This function should return the trip data analysis

// Function to calculate total billed amount
function calculateTotalBilledAmount(trips) {
  return trips.reduce((total, trip) => total + trip.billed, 0);
}

// Function to filter cash trips
function filterCashTrips(trips) {
  return trips.filter(trip => trip.isCash);
}

// Function to filter non-cash trips
function filterNonCashTrips(trips) {
  return trips.filter(trip => !trip.isCash);
}

// Function to retrieve data for all trips
async function analysis() {
   // Your code goes here
  const trips = await api.getTrips('api/data/trips.json');

  const noOfCashTrips = filterCashTrips(trips).length;
  const noOfNonCashTrips = filterNonCashTrips(trips).length;
  const billedTotal = calculateTotalBilledAmount(trips);
  const cashTrips = filterCashTrips(trips);
  const nonCashTrips = filterNonCashTrips(trips);
  const cashBilledTotal = calculateTotalBilledAmount(cashTrips);
  const nonCashBilledTotal = calculateTotalBilledAmount(nonCashTrips);

  const drivers = await Promise.all(trips.map(trip => api.getDriver(trip.driverId)));

  const noOfDriversWithMoreThanOneVehicle = drivers.filter(driver => driver.vehicleID.length > 1).length;
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
    highestEarningDriver
  };

  return result;
}

// Function to retrieve data for every driver on the platform
async function getDriverData() {
  const drivers = await api.getDriver('api/data/drivers.json');

  const result = [];

  for (const driver of drivers) {
    try {
      const trips = await api.getTripsByDriver(driver.id);

      const vehicles = await Promise.all(driver.vehicleID.map(vehicleId => api.getVehicle(vehicleId)));

      const driverData = {
        fullName: driver.name,
        id: driver.id,
        phone: driver.phone,
        noOfTrips: trips.length,
        noOfVehicles: vehicles.length,
        vehicles: vehicles.map(vehicle => ({
          plate: vehicle.plate,
          manufacturer: vehicle.manufacturer
        })),
        noOfCashTrips: filterCashTrips(trips).length,
        noOfNonCashTrips: filterNonCashTrips(trips).length,
        totalAmountEarned: calculateTotalBilledAmount(trips),
        totalCashAmount: calculateTotalBilledAmount(filterCashTrips(trips)),
        totalNonCashAmount: calculateTotalBilledAmount(filterNonCashTrips(trips)),
        trips: trips.map(trip => ({
          user: trip.user,
          created: trip.created,
          pickup: trip.pickup,
          destination: trip.destination,
          billed: trip.billed,
          isCash: trip.isCash
        }))
      };

      result.push(driverData);
    } catch (error) {
      // Handle the scenario when a driver's information is missing
      const driverData = {
        fullName: '',
        id: driver.id,
        phone: driver.phone,
        noOfTrips: 0,
        noOfVehicles: 0,
        vehicles: [],
        noOfCashTrips: 0,
        noOfNonCashTrips: 0,
        totalAmountEarned: 0,
        totalCashAmount: 0,
        totalNonCashAmount: 0,
        trips: []
      };

      result.push(driverData);
    }
  }

  return result;
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


module.exports = analysis;
