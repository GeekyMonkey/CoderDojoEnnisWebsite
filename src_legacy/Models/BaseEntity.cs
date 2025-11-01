using System;
using System.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CoderDojo
{
    public abstract class BaseEntity
    {
        public BaseEntity()
        {
        }

        public string ImageUrl
        {
            get
            {
                string typeName = this.GetType().Name;
                if (typeName.Contains('_'))
                {
                    typeName = typeName.Substring(0, this.GetType().Name.IndexOf("_"));
                }
                return ConfigurationManager.AppSettings["ImageUrl"] + typeName + "_" + (this as IId).Id.ToString("N") + ".jpg"; 
            }
        }

    }
}