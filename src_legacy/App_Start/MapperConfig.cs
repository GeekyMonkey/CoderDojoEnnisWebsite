using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;

namespace CoderDojo
{
    public static class MapperConfig
    {
        public static void ConfigMappers()
        {
            Mapper.CreateMap<Adult, ApiAdult>();
        }
    }
}