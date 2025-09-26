import { ethers } from "hardhat";

async function main() {
  const TouristID = await ethers.getContractFactory("TouristID");
  const touristID = await TouristID.deploy();

  console.log("TouristID contract deployed to:", touristID.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});