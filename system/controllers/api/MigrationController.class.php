<?php

namespace srms\sof\controllers\api;


use srms\sof\controllers\AppController;
use srms\sof\controllers\DBController;

class MigrationController extends ApiController
{
    const ACTIVE = false;

    public function addStatsAction()
    {
        $this->addTree($this->getStatsJson(), "stats");
    }

    public function addClassesAction()
    {
        $this->addTree($this->getClassesJson(), "classes");
    }

    public function addPerksAction()
    {
        $this->addTree($this->getPerksJson(), "perks");
    }

    private function addTree($json, $collection)
    {
        if(!self::ACTIVE)
            return;

        $obj = json_decode($json, false);

        foreach($obj->$collection as $id => $item)
        {
            $this->addClass($id, $item, $collection);
        }
    }

    private function addClass($id, $class, $collection)
    {
        $class->_id = $id;

        if (!empty($class->sub)) {
            $children = $class->sub;
            unset($class->sub);
            $class->children = [];

            foreach ($children as $childId => $child) {
                array_push($class->children, $childId);
                $child->parent = $id;
                $this->addClass($childId, $child, $collection);
            }
        }

        AppController::printVariable(DBController::db()->$collection->insert($class));
    }

    private function addStatsOld()
    {
        if(!self::ACTIVE)
            return;

        $json = $this->getStatsJson();
        $obj = json_decode($json, false);

        foreach ($obj->stats as $id => $item) {
            $item->_id = $id;

            if (!empty($item->sub)) {
                $sub = $item->sub;
                unset($item->sub);
                $item->children = [];
                foreach ($sub as $k => $v) {
                    array_push($item->children, $k);

                    $child = $v;
                    $child->_id = $k;
                    $child->parent = $id;
                    AppController::printVariable(DBController::db()->stats->insert($child));
                    echo '<hr/>';
                }
            }

            AppController::printVariable(DBController::db()->stats->insert($item));

            echo '<hr/><hr/>';
        }
    }

    public function getPerksJson()
    {
        return '{
        "perks": {
        "steelSkin": {
            "level": 1,
            "price": 100,
            "name": "Стальная кожа",
            "desc": "",
            "effects": {
                "add": {
                    "hp": 1
                }
            },
            "for": {
                "level": 4
            }
        },

        "bigPockets": {
            "level": 1,
            "price": 100,
            "name": "Еще подсумок",
            "desc": "",
            "effects": {
                "add": {
                    "ammo": 1
                }
            },
            "for": {
                "level": 4,
                "classExcept": ["dominator-1", "dominator-2", "dominator-3"]
            }
        },

        "nopain-1": {
            "level": 1,
            "price": 100,
            "name": "Невоспр. к боли",
            "desc": "",
            "effects": {
                "add": {
                    "shock": 0.1,
                    "god": 0.1
                }
            },
            "for": {
                "level": 4
            },
            "sub": {
                "nopain-2": {
                    "parent": "nopain-1",
                    "level": 2,
                    "price": 300,
                    "name": "Суперневоспр. к боли",
                    "desc": "",
                    "effects": {
                        "add": {
                            "shock": 0.1,
                            "god": 0.1
                        }
                    },
                    "for": {
                        "level": 4
                    }
                }
            }
        },

        "moreRounds-1": {
            "level": 1,
            "price": 100,
            "name": "Расширенные магазины",
            "desc": "",
            "effects": {
                "add": {
                    "rounds": 2
                }
            },
            "for": {
                "level": 2,
                "classExcept": ["dominator-1", "dominator-2", "dominator-3",
                    "marksman-1", "marksman-2", "marksman-3",
                    "predator-1", "predator-2", "predator-3"]
            },
            "sub": {
                "moreRounds-2": {
                    "parent": "moreRounds-1",
                    "level": 2,
                    "price": 300,
                    "name": "Большие магазины",
                    "desc": "",
                    "effects": {
                        "add": {
                            "rounds": 3
                        }
                    },
                    "for": {
                        "level": 3,
                        "classExcept": ["dominator-2", "dominator-3", "marksman-2", "marksman-3",
                            "predator-2", "predator-3"]
                    },
                    "sub": {
                        "moreRounds-3": {
                            "parent": "moreRounds-2",
                            "level": 3,
                            "price": 600,
                            "name": "Здоровенные магазины",
                            "desc": "",
                            "effects": {
                                "add": {
                                    "rounds": 4
                                }
                            },
                            "for": {
                                "level": 4,
                                "classExcept": ["dominator-3", "marksman-3", "predator-3"]
                            }
                        }
                    }
                }
            }
        },


        "sniperMoreRounds-1": {
            "level": 1,
            "price": 100,
            "name": "Расширенные магазины снайпера",
            "desc": "",
            "effects": {
                "add": {
                    "rounds": 1
                }
            },
            "for": {
                "level": 3,
                "classOnly": ["marksman-2", "marksman-3", "predator-2", "predator-3"]
            },
            "sub": {
                "sniperMoreRounds-2": {
                    "parent": "sniperMoreRounds-1",
                    "level": 2,
                    "price": 300,
                    "name": "Большие магазины снайпера",
                    "desc": "",
                    "effects": {
                        "add": {
                            "rounds": 1
                        }
                    },
                    "for": {
                        "level": 4,
                        "classOnly": ["marksman-3", "predator-3"]
                    },
                    "sub": {
                        "sniperMoreRounds-3": {
                            "parent": "sniperMoreRounds-2",
                            "level": 3,
                            "price": 600,
                            "name": "Здоровенные магазины снайпера",
                            "desc": "",
                            "effects": {
                                "add": {
                                    "rounds": 1
                                }
                            },
                            "for": {
                                "level": 4,
                                "classOnly": ["marksman-3", "predator-3"]
                            }
                        }
                    }
                }
            }
        },

        "weaponCare-1": {
            "level": 1,
            "price": 100,
            "name": "Уход за оружием",
            "desc": "",
            "effects": {
                "add": {
                    "speed": 25
                }
            },
            "for": {
                "level": 4,
                "classExcept": ["dominator-1", "dominator-2", "dominator-3"]
            },
            "sub": {
                "weaponCare-2": {
                    "parent": "weaponCare-1",
                    "level": 2,
                    "price": 300,
                    "name": "Крутой уход за оружием",
                    "desc": "",
                    "effects": {
                        "add": {
                            "speed": 25
                        }
                    },
                    "for": {
                        "level": 4,
                        "classExcept": ["dominator-1", "dominator-2", "dominator-3"]
                    }
                }
            }
        },

        "extraWeapon": {
            "level": 1,
            "price": 100,
            "name": "Сюрприз из кобуры",
            "desc": "",
            "effects": {
                "provide": {
                    "extraWeapon": null
                }
            },
            "for": {
                "level": 4
            },
            "sub": {
                "ammoBalance": {
                    "parent": "extraWeapon",
                    "level": 2,
                    "price": 300,
                    "name": "Македонец",
                    "desc": "",
                    "effects": {
                        "provide": {
                            "ammoBalance": null
                        }
                    },
                    "for": {
                        "level": 4
                    },
                    "classExcept": [
                        "support",
                        "cleaner-1", "cleaner-2", "cleaner-3",
                        "dominator-1", "dominator-2", "dominator-3",
                        "sniper",
                        "marksman-1", "marksman-2", "marksman-3",
                        "predator-1", "predator-2", "predator-3"]
                }
            }
        },

        "bomber": {
            "level": 1,
            "price": 100,
            "name": "Гранатометчик",
            "desc": "",
            "effects": {
                "provide": {
                    "launcher": null
                }
            },
            "for": {
                "level": 4,
                "classOnly": ["supplier-3", "juggernaut-3", "destroyer-3"]
            }
        },

        "doctor": {
            "level": 1,
            "price": 100,
            "name": "Доктор наук",
            "desc": "",
            "effects": {
                "add": {
                    "damage": -2,
                    "defib": 2,
                    "morphine": {
                        "morphineQty": 7
                    }
                }
            },
            "for": {
                "level": 4,
                "classOnly": ["surgeon-3"]
            }
        },

        "bigBag-1": {
            "level": 1,
            "price": 100,
            "name": "Большой рюкзак",
            "desc": "",
            "effects": {
                "mul": {
                    "extraAmmo": 1.33
                }
            },
            "for": {
                "level": 3,
                "classOnly": ["supplier-2", "supplier-3", "sapper-2", "sapper-3"]
            },
            "sub": {
                "bigBag-2": {
                    "parent": "bigBag-1",
                    "level": 2,
                    "price": 300,
                    "name": "Огромный рюкзак",
                    "desc": "",
                    "effects": {
                        "mul": {
                            "extraAmmo": 1.33
                        }
                    },
                    "for": {
                        "level": 4,
                        "classOnly": ["supplier-3", "sapper-3"]
                    },
                    "sub": {
                        "bigBag-3": {
                            "parent": "bigBag-2",
                            "level": 3,
                            "price": 600,
                            "name": "Гиганторский рюкзак",
                            "desc": "",
                            "effects": {
                                "mul": {
                                    "extraAmmo": 1.33
                                }
                            },
                            "for": {
                                "level": 4,
                                "classOnly": ["supplier-3", "sapper-3"]
                            }
                        }
                    }
                }
            }
        },

        "radioMines": {
            "level": 1,
            "price": 100,
            "name": "Радиосвязь",
            "desc": "",
            "effects": {
                "mul": {
                    "extraAmmo": 0.7
                },
                "provide": {
                    "radioMine": null
                }
            },
            "for": {
                "level": 4,
                "classOnly": ["supplier-3"]
            }
        },

        "initiative": {
            "level": 1,
            "price": 5100,
            "name": "Супер реакция",
            "desc": "",
            "effects": {
                "add": {
                    "god": 0.1
                }
            },
            "for": {
                "level": 4,
                "ultimate": true
            }
        }
    }
        }';
    }


    public function getClassesJson()
    {
        return '{
        "classes": {
        "base": {
            "name": "Наемник",
            "desc": "Обычный лошпед с пушкой",
            "level": 0,
            "price": 0,
            "stats": {
                "base": {
                    "hp": 16,
                    "damage": 7,
                    "ammo": 7,
                    "rounds": 15,
                    "speed": 300,
                    "reload": 5,
                    "shock": 0.6,
                    "god": 0.6
                },
                "special": {
                }
            },
            "sub": {
                "stormtrooper": {
                    "parent": "base",
                    "name": "Штурмовик",
                    "desc": "Он штурмует! ололо! Засыпкин, берегись!",
                    "level": 1,
                    "price": 100,
                    "stats": {
                        "base": {
                            "hp": 18,
                            "damage": 4,
                            "speed": 500,
                            "rounds": 30,
                            "ammo": 5
                        },
                        "special": {}
                    },
                    "sub": {
                        "destroyer-1": {
                            "parent": "stormtrooper",
                            "name": "Дестроер Mk-1",
                            "desc": "Убивает почти всё живое.",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "damage": 5
                                },
                                "special": {
                                    "grenade": null
                                }
                            },
                            "sub": {
                                "destroyer-2": {
                                    "parent": "destroyer-1",
                                    "name": "Дестроер Mk-2",
                                    "desc": "Убивает всё живое.",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "damage": 7,
                                            "hp": 21
                                        },
                                        "special": {}
                                    },
                                    "sub": {
                                        "destroyer-3": {
                                            "parent": "destroyer-2",
                                            "name": "Дестроер Mk-3",
                                            "desc": "Убивает всё живое, мертвое оживляет и тоже убивает.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "damage": 10,
                                                    "hp": 25
                                                },
                                                "special": {}
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "juggernaut-1": {
                            "parent": "stormtrooper",
                            "name": "Джаггернаут Mk-1",
                            "desc": "Долго умирает.",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "hp": 25
                                },
                                "special": {
                                    "grenade": null
                                }
                            },
                            "sub": {
                                "juggernaut-2": {
                                    "parent": "juggernaut-1",
                                    "name": "Джаггернаут Mk-2",
                                    "desc": "Очень долго умирает.",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "hp": 28,
                                            "ammo": 6,
                                            "speed": 550,
                                            "shock": 0.8,
                                            "god": 0.8
                                        },
                                        "special": {}
                                    },
                                    "sub": {
                                        "juggernaut-3": {
                                            "parent": "juggernaut-2",
                                            "name": "Джаггернаут Mk-3",
                                            "desc": "Почти не умирает.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "hp": 31,
                                                    "ammo": 7,
                                                    "speed": 600,
                                                    "shock": 1,
                                                    "god": 1
                                                },
                                                "special": {}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "sniper": {
                    "parent": "base",
                    "name": "Снайпер",
                    "desc": "Он пырит в прицел.",
                    "level": 1,
                    "price": 100,
                    "stats": {
                        "base": {
                            "damage": 10,
                            "speed": 150,
                            "rounds": 10,
                            "ammo": 5
                        },
                        "special": {}
                    },
                    "sub": {
                        "marksman-1": {
                            "parent": "sniper",
                            "name": "Марксмен Mk-1",
                            "desc": "Легкий снайпер",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "hp": 18,
                                    "speed": 200,
                                    "ammo": 7
                                },
                                "special": {}
                            },
                            "sub": {
                                "marksman-2": {
                                    "parent": "marksman-1",
                                    "name": "Марксмен Mk-2",
                                    "desc": "Место для остроумного описания.",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "hp": 21,
                                            "speed": 250,
                                            "ammo": 7,
                                            "reload": 7
                                        },
                                        "special": {
                                            "mine": null
                                        }
                                    },
                                    "sub": {
                                        "marksman-3": {
                                            "parent": "marksman-2",
                                            "name": "Марксмен Mk-3",
                                            "desc": "Легкий снайпер, может даже и штурмануть.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "hp": 25,
                                                    "damage": 15,
                                                    "rounds": 20,
                                                    "ammo": 5
                                                },
                                                "special": {}
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "predator-1": {
                            "parent": "sniper",
                            "name": "Хищник Mk-1",
                            "desc": "Ныкается по кустам и больно оттуда пуляется.",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "damage": 15,
                                    "speed": 60,
                                    "reload": 7
                                },
                                "special": {
                                    "mine": null
                                }
                            },
                            "sub": {
                                "predator-2": {
                                    "parent": "predator-1",
                                    "name": "Хищник Mk-2",
                                    "desc": "Выслеживает и уничтожает.",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "hp": 18,
                                            "speed": 100,
                                            "ammo": 7
                                        },
                                        "special": {}
                                    },
                                    "sub": {
                                        "predator-3": {
                                            "parent": "predator-2",
                                            "name": "Хищник Mk-3",
                                            "desc": "Вам пиздец.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "hp": 21,
                                                    "damage": 20,
                                                    "rounds": 5,
                                                    "ammo": 20,
                                                    "reload": 10
                                                },
                                                "special": {
                                                    "motionMine": null
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "support": {
                    "parent": "base",
                    "name": "Саппорт",
                    "desc": "Он прижимает врагов к земле, стреляя из пулемета!",
                    "level": 1,
                    "price": 100,
                    "stats": {
                        "base": {
                            "damage": 5,
                            "speed": 600,
                            "rounds": 45,
                            "ammo": 5,
                            "reload": 6,
                            "hp": 18
                        },
                        "special": {}
                    },
                    "sub": {
                        "cleaner-1": {
                            "parent": "support",
                            "name": "Чистильщик Mk-1",
                            "desc": "Быстренько добивает раненных короткими очередями.",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "rounds": 40
                                },
                                "special": {}
                            },
                            "sub": {
                                "cleaner-2": {
                                    "parent": "cleaner-1",
                                    "name": "Чистильщик Mk-2",
                                    "desc": "Швыряется гранатами и добивает выживших.",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "damage": 7,
                                            "rounds": 45,
                                            "hp": 21
                                        },
                                        "special": {
                                            "grenade": null
                                        }
                                    },
                                    "sub": {
                                        "cleaner-3": {
                                            "parent": "cleaner-2",
                                            "name": "Чистильщик Mk-3",
                                            "desc": "Мистер Пропер.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "rounds": 50,
                                                    "hp": 25
                                                },
                                                "special": {}
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "dominator-1": {
                            "parent": "support",
                            "name": "Доминатор Mk-1",
                            "desc": "Кто был непослушным мальчиком?!",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "rounds": 60,
                                    "ammo": 4,
                                    "reload": 8,
                                    "hp": 21
                                },
                                "special": {}
                            },
                            "sub": {
                                "dominator-2": {
                                    "parent": "dominator-1",
                                    "name": "Доминатор Mk-2",
                                    "desc": "Только попробуй поднять голову!",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "reload": 10,
                                            "hp": 25
                                        },
                                        "special": {
                                            "grenade": null
                                        }
                                    },
                                    "sub": {
                                        "dominator-3": {
                                            "parent": "dominator-2",
                                            "name": "Доминатор Mk-3",
                                            "desc": "Очереди длинною в вечность.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "speed": 650,
                                                    "rounds": 90,
                                                    "ammo": 3,
                                                    "reload": 12,
                                                    "hp": 28
                                                },
                                                "special": {}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "engineer": {
                    "parent": "base",
                    "name": "Инженер",
                    "desc": "Делает всякие штуки",
                    "level": 1,
                    "price": 100,
                    "stats": {
                        "base": {
                            "damage": 4,
                            "speed": 550,
                            "rounds": 30,
                            "ammo": 5
                        },
                        "special": {
                            "extraAmmo": 5,
                            "key": null,
                            "grenade": null
                        }
                    },
                    "sub": {
                        "sapper-1": {
                            "parent": "engineer",
                            "name": "Сапер Mk-1",
                            "desc": "Минирует-разминирует.",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "hp": 18
                                },
                                "special": {
                                    "extraAmmo": 3,
                                    "defuse": null,
                                    "mine": null
                                }
                            },
                            "sub": {
                                "sapper-2": {
                                    "parent": "sapper-1",
                                    "name": "Сапер Mk-2",
                                    "desc": "Взрывать! Взрывать всё!",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "hp": 21
                                        },
                                        "special": {
                                            "motionMine": null,
                                            "launcher": null
                                        }
                                    },
                                    "sub": {
                                        "sapper-3": {
                                            "parent": "sapper-2",
                                            "name": "Сапер Mk-3",
                                            "desc": "Может устроить локальный экстерминатус.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "damage": 5,
                                                    "hp": 25
                                                },
                                                "special": {
                                                    "radioMine": null,
                                                    "bomb": null
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "supplier-1": {
                            "parent": "engineer",
                            "name": "Снабженец Mk-1",
                            "desc": "У него есть боеприпасы.",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "hp": 18
                                },
                                "special": {
                                    "extraAmmo": 7
                                }
                            },
                            "sub": {
                                "supplier-2": {
                                    "parent": "supplier-1",
                                    "name": "Снабженец Mk-2",
                                    "desc": "У него есть много боеприпасов.",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "hp": 21
                                        },
                                        "special": {
                                            "extraAmmo": 10,
                                            "mine": null
                                        }
                                    },
                                    "sub": {
                                        "supplier-3": {
                                            "parent": "supplier-2",
                                            "name": "Снабженец Mk-3",
                                            "desc": "Человек-склад боеприпасов.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "speed": 600,
                                                    "hp": 25
                                                },
                                                "special": {
                                                    "extraAmmo": 15,
                                                    "motionMine": null
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "medic": {
                    "parent": "base",
                    "name": "Медик",
                    "desc": "Он может лечить. А может и не лечить.",
                    "level": 1,
                    "price": 100,
                    "stats": {
                        "base": {
                            "damage": 5,
                            "speed": 200,
                            "ammo": 5,
                            "hp": 15
                        },
                        "special": {
                            "bandage": {
                                "bandageHp": 5,
                                "bandageQty": 10,
                                "bandageTime": 2
                            }
                        }
                    },
                    "sub": {
                        "paramedic-1": {
                            "parent": "medic",
                            "name": "Фельдшер Mk-1",
                            "desc": "Спец по мелким ранам. Ногу не пришьет.",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "speed": 250,
                                    "rounds": 20,
                                    "hp": 21
                                },
                                "special": {
                                    "morphine": {
                                        "morphineHp": 15,
                                        "morphineQty": 3,
                                        "morphineTime": 4
                                    }
                                }
                            },
                            "sub": {
                                "paramedic-2": {
                                    "parent": "paramedic-1",
                                    "name": "Фельдшер Mk-2",
                                    "desc": "Спец по мелким ранам. Ногу не пришьет.",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "damage": 7,
                                            "hp": 25
                                        },
                                        "special": {
                                            "bandage": {
                                                "bandageHp": 7
                                            },
                                            "morphine": {
                                                "morphineHp": 20
                                            },
                                            "adrenaline": 1
                                        }
                                    },
                                    "sub": {
                                        "paramedic-3": {
                                            "parent": "paramedic-2",
                                            "name": "Фельдшер Mk-3",
                                            "desc": "Спец по мелким ранам. Ногу не пришьет.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "speed": 300,
                                                    "hp": 28
                                                },
                                                "special": {
                                                    "bandage": {
                                                        "bandageHp": 10
                                                    },
                                                    "morphine": {
                                                        "morphineHp": 25
                                                    }
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        },
                        "surgeon-1": {
                            "parent": "medic",
                            "name": "Хирург Mk-1",
                            "desc": "Отрежет ногу прямо в окопе.",
                            "level": 2,
                            "price": 300,
                            "stats": {
                                "base": {
                                    "speed": 250,
                                    "rounds": 20,
                                    "hp": 16
                                },
                                "special": {
                                    "bandage": {
                                        "bandageQty": 3
                                    },
                                    "morphine": {
                                        "morphineHp": 25,
                                        "morphineQty": 7,
                                        "morphineTime": 4
                                    },
                                    "defib": 1
                                }
                            },
                            "sub": {
                                "surgeon-2": {
                                    "parent": "surgeon-1",
                                    "name": "Хирург Mk-2",
                                    "desc": "Вырежет аппендицит под огнем противника.",
                                    "level": 3,
                                    "price": 600,
                                    "stats": {
                                        "base": {
                                            "damage": 7,
                                            "hp": 18
                                        },
                                        "special": {
                                            "bandage": {
                                                "bandageHp": 7
                                            },
                                            "morphine": {
                                                "morphineHp": 28
                                            },
                                            "defib": 2
                                        }
                                    },
                                    "sub": {
                                        "surgeon-3": {
                                            "parent": "surgeon-2",
                                            "name": "Хирург Mk-3",
                                            "desc": "Вынет пулю и заштопает, не моргнув глазом.",
                                            "level": 4,
                                            "price": 1400,
                                            "stats": {
                                                "base": {
                                                    "speed": 300,
                                                    "hp": 21
                                                },
                                                "special": {
                                                    "bandage": {
                                                        "bandageHp": 10
                                                    },
                                                    "morphine": {
                                                        "morphineHp": 31
                                                    },
                                                    "defib": 3
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
        }';
    }

    public function getStatsJson()
    {
        return '{
        "stats": {
        "hp": {
            "name": "ХП",
            "desc": "Здоровье бойца",
            "measure": "ед",
            "order": 5000
        },
        "damage": {
            "name": "Урон",
            "desc": "Количество ХП, снимаемое за один выстрел",
            "measure": "ед",
            "order": 4900
        },
        "speed": {
            "name": "Скорострельность",
            "desc": "Количество выстрелов в секунду",
            "measure": "выс/с",
            "order": 4800
        },
        "rounds": {
            "name": "Емкость магазина",
            "desc": "Количество патронов в магазине",
            "order": 4500
        },
        "ammo": {
            "name": "Количество магазинов",
            "desc": "Количество магазинов при воскрешении",
            "order": 4600
        },
        "reload": {
            "name": "Время перезарядк",
            "desc": "Время перезарядки",
            "measure": "сек",
            "order": 4700
        },
        "shock": {
            "name": "Шок",
            "desc": "Время шока (нельзя стерлять) после ранения",
            "measure": "сек",
            "order": 4400
        },
        "god": {
            "name": "Неуязвимость",
            "desc": "Время неуязвимости после ранения",
            "measure": "сек",
            "order": 4300
        },
        "bandage": {
            "name": "Бинты",
            "desc": "Перевязочный комплект. Восстанавливает небольшое количество здоровья.",
            "order": 2000,
            "sub": {
                "bandageHp": {
                    "name": "ХП",
                    "desc": "Кол-во восстанавливаемого здоровья",
                    "order": 1000
                },
                "bandageTime": {
                    "name": "Время",
                    "desc": "Время применения",
                    "measure": "сек",
                    "order": 900
                },
                "bandageQty": {
                    "name": "Кол-во",
                    "desc": "Количество штук",
                    "measure": "шт",
                    "order": 800
                }
            }
        },
        "morphine": {
            "name": "Морфин+",
            "desc": "Крутой препарат. Восстанавливает большое количество здоровья.",
            "order": 1900,
            "sub": {
                "morphineHp": {
                    "name": "ХП",
                    "desc": "Кол-во восстанавливаемого здоровья",
                    "order": 1000
                },
                "morphineTime": {
                    "name": "Время",
                    "desc": "Время применения",
                    "measure": "сек",
                    "order": 900
                },
                "morphineQty": {
                    "name": "Кол-во",
                    "desc": "Количество штук",
                    "measure": "шт",
                    "order": 800
                }
            }
        },
        "adrenaline": {
            "name": "Адреналин",
            "desc": "Увеличивает ХП в 2 раза",
            "measure": "ампул",
            "order": 2900
        },
        "defib": {
            "name": "Дефибриллятор",
            "desc": "Оживляет убитого бойца.",
            "measure": "шт",
            "order": 3000
        },
        "mine": {
            "name": "Мина-растяжка",
            "desc": "Возможность пользоваться минами-растяжками. С леской.",
            "order": 2200
        },
        "motionMine": {
            "name": "Мина с детектором движения",
            "desc": "Возможность пользоваться минами с детектором движения.",
            "order": 2100
        },
        "grenade": {
            "name": "Гранаты",
            "desc": "Возможность пользоваться гранатами.",
            "order": 2300
        },
        "defuse": {
            "name": "Кусачки",
            "desc": "Набор для обезвреживания взрывчатки.",
            "order": 2600
        },
        "radioMine": {
            "name": "Радио-мина",
            "desc": "Возможность пользоваться минами с радио-управлением.",
            "order": 2000
        },
        "key": {
            "name": "Набор отмычек",
            "desc": "Может открыть запертые проходы, которые нельзя открыть другими способами.",
            "order": 2500
        },
        "bomb": {
            "name": "ИВУ",
            "desc": "Возможность устанавливать взрывное устройство.",
            "order": 2400
        },
        "launcher": {
            "name": "Гранатомет",
            "desc": "Возможносьт пользоваться гранатометом.",
            "order": 2900
        },
        "extraAmmo": {
            "name": "Универсальные магазины",
            "desc": "Носит с собой универсальные магазины. Для всех. Даром.",
            "order": 3000
        },
        "extraWeapon": {
            "name": "Дополнительное оружие",
            "desc": "Возможность носить второе оружие",
            "order": 2800
        },
        "ammoBalance": {
            "name": "Распределение патронов",
            "desc": "Возможность перераспределять патроны между основным и вторичным оружием",
            "order": 2700
        }
    }
        }';
    }
}
