import  pnp  from "sp-pnp-js";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export class Api {
    constructor(context:WebPartContext){
        pnp.setup({
            spfxContext: context
        });
    }

    public getPeople(filterText: string): Promise<any[]> {
        return pnp.sp.web.siteUsers
        .select("*")
        .filter("("+[
            "substringof('" + filterText + "',Title)",
            "substringof('" + filterText + "',Email)",
            "substringof('" + this.capitalizeFirstLetter(filterText) + "',Title)",
            "substringof('" + this.capitalizeFirstLetter(filterText) + "',Email)"
          ].join(" or ")+ ") and PrincipalType eq 1")
          .get()
          .then(res => {
              return res;
            });
    }

    public capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}