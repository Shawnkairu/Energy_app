from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from . import Base


class Building(Base):
    __tablename__ = "buildings"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    location_band: Mapped[str] = mapped_column(String, nullable=False)
    units: Mapped[int] = mapped_column(Integer, nullable=False)
    stage: Mapped[str] = mapped_column(String, nullable=False)


class EnergyConfig(Base):
    __tablename__ = "energy_configs"
    building_id: Mapped[str] = mapped_column(ForeignKey("buildings.id"), primary_key=True)
    array_kw: Mapped[float] = mapped_column(Float, nullable=False)
    peak_sun_hours: Mapped[float] = mapped_column(Float, nullable=False)
    system_efficiency: Mapped[float] = mapped_column(Float, nullable=False)
    battery_kwh: Mapped[float] = mapped_column(Float, nullable=False)
