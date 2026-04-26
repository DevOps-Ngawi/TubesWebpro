const prisma = require('./prisma')

async function getAllLevels() {
    return prisma.levels.findMany({
        include: {
            sections: true
        },
        orderBy: {
            urutan: 'asc'
        }
    })
}

async function getLevelsBySection(slugSection) {
    return prisma.levels.findMany({
        where: {
            sections: {
                is: {
                    slug: slugSection
                }
            }
        },
        include: {
            sections: true
        },
        orderBy: {
            urutan: 'asc'
        }
    })
}

async function getLevelsBySectionId(slugSection, id) {
    return prisma.levels.findFirst({
        where: {
            sections: {
                is: {
                    slug: slugSection
                }
            },
            id: Number(id)
        },
        include: {
            soals: {
                include: {
                    opsis: true
                }
            }
        }
    })
}

async function getLevelById(id) {
    return prisma.levels.findUnique({
        where: {
            id: Number(id)
        },
        include: {
            soals: {
                include: {
                    opsis: true
                }
            }
        }
    })
}

// Field baru: deskripsi dan urutan
async function createLevel(idSection, nama, deskripsi = null, urutan = null) {
    return prisma.levels.create({
        data: {
            id_section: Number(idSection),
            nama: nama,
            deskripsi: deskripsi || null,
            urutan: urutan ? Number(urutan) : null
        }
    })
}

// Field baru: deskripsi dan urutan
async function updateLevel(id, idSection, nama, deskripsi = null, urutan = null) {
    return prisma.levels.update({
        where: {
            id: Number(id)
        },
        data: {
            id_section: Number(idSection),
            nama: nama,
            deskripsi: deskripsi || null,
            urutan: urutan ? Number(urutan) : null
        }
    })
}

async function deleteLevel(id) {
    return prisma.levels.delete({
        where: {
            id: Number(id)
        }
    })
}

async function getSoalsByLevelId(slugSection, idLevel) {
    console.log(`getSoalsByLevelId: slugSection=${slugSection}, idLevel=${idLevel}`);
    
    const level = await prisma.levels.findFirst({
        where: {
            id: Number(idLevel),
            sections: {
                is: {
                    slug: slugSection
                }
            }
        }
    });

    console.log(`Level found: ${level ? 'yes' : 'no'}`);
    if (!level) {
        console.log(`Level ${idLevel} not found in section ${slugSection}`);
        return [];
    }

    const soals = await prisma.soals.findMany({
        where: {
            id_level: Number(idLevel)
        },
        include: {
            opsis: true
        },
        orderBy: {
            id: 'asc'
        }
    });
    
    console.log(`Found ${soals.length} soals for level ${idLevel}`);
    return soals;
}

async function getSoalByLevelIdAndSoalId(slugSection, idLevel, idSoal) {
    console.log(`getSoalByLevelIdAndSoalId: slugSection=${slugSection}, idLevel=${idLevel}, idSoal=${idSoal}`);
    
    const level = await prisma.levels.findFirst({
        where: {
            id: Number(idLevel),
            sections: {
                is: {
                    slug: slugSection
                }
            }
        },
        include: {
            sections: {
                select: {
                    id: true,
                    nama: true,
                    slug: true
                }
            }
        }
    });

    console.log(`Level found: ${level ? 'yes' : 'no'}`);
    if (level) {
        console.log(`Level ${idLevel} is in section: id=${level.sections.id}, nama=${level.sections.nama}, slug=${level.sections.slug}`);
    } else {
        const levelInOtherSection = await prisma.levels.findUnique({
            where: { id: Number(idLevel) },
            include: {
                sections: {
                    select: {
                        id: true,
                        nama: true,
                        slug: true
                    }
                }
            }
        });
        if (levelInOtherSection) {
            console.log(`Level ${idLevel} exists but in section: id=${levelInOtherSection.sections.id}, nama=${levelInOtherSection.sections.nama}, slug=${levelInOtherSection.sections.slug}`);
        } else {
            console.log(`Level ${idLevel} does not exist at all`);
        }
        return null;
    }

    const soal = await prisma.soals.findFirst({
        where: {
            id: Number(idSoal),
            id_level: Number(idLevel)
        },
        include: {
            opsis: true
        }
    });
    
    console.log(`Soal found: ${soal ? 'yes' : 'no'}`);
    return soal;
}

module.exports = {
    getAllLevels,
    getLevelById,
    getLevelsBySectionId,
    getLevelsBySection,
    createLevel,
    updateLevel,
    deleteLevel,
    getSoalsByLevelId,
    getSoalByLevelIdAndSoalId
}