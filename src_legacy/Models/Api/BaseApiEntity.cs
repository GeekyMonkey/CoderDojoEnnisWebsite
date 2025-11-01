using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CoderDojo
{
    public abstract class BaseApiEntity
    {
        public BaseApiEntity()
        {
        }

        public System.Guid Id { get; set; }
    }
}