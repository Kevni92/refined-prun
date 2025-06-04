
export function replacePlanetNameWithLocal(sites: PrunApi.Site[])
{
    sites.forEach((site: PrunApi.Site) => {
        site.address.lines.forEach((adressLine: PrunApi.AddressLine) => {
            if (adressLine.type != "PLANET") return;

            //adressLine.entity.name = "Hallo";
        })
    });


    return sites;
}
