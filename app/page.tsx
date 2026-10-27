import { db } from "@/lib/db";
import Market from "./ui/Market";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, farmers] = await Promise.all([
    db.product.findMany({ where: { active: true }, include: { farmer: true }, orderBy: [{ featured: "desc" }, { name: "asc" }] }),
    db.farmer.findMany({ where: { verified: true }, orderBy: { farmName: "asc" } })
  ]);
  const safeProducts = products.map(p => ({
    id: p.id, name: p.name, description: p.description, category: p.category,
    pricePaise: p.pricePaise, unit: p.unit, image: p.image, stock: p.stock,
    featured: p.featured, farmerId: p.farmerId, farmerName: p.farmer.farmName,
    farmerLocation: p.farmer.location
  }));
  return <Market products={safeProducts} farmers={farmers.map(f=>({id:f.id,name:f.name,farmName:f.farmName,location:f.location,description:f.description}))} />;
}