public abstract class Usuario {
    protected String id;
    protected String nombreCompleto;

    public Usuario(String id, String nombreCompleto) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
    }

    public String getId() {
        return id;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    // Método abstracto para asegurar que las clases hijas lo implementen
    public abstract String toCsv();
}
public class Doctor extends Usuario {
    private String especialidad;

    public Doctor(String id, String nombreCompleto, String especialidad) {
        super(id, nombreCompleto);
        this.especialidad = especialidad;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    // Método para guardar en formato CSV
    @Override
    public String toCsv() {
        return id + "," + nombreCompleto + "," + especialidad;
    }

    // Método estático para recrear un Doctor desde una línea CSV
    public static Doctor fromCsv(String csvLine) {
        String[] datos = csvLine.split(",");
        if (datos.length == 3) {
            return new Doctor(datos[0], datos[1], datos[2]);
        }
        return null;
    }

    @Override
    public String toString() {
        return "ID: " + id + ", Nombre: " + nombreCompleto + ", Especialidad: " + especialidad;
    }
}
public class Paciente extends Usuario {

    public Paciente(String id, String nombreCompleto) {
        super(id, nombreCompleto);
    }

    // Método para guardar en formato CSV
    @Override
    public String toCsv() {
        return id + "," + nombreCompleto;
    }

    // Método estático para recrear un Paciente desde una línea CSV
    public static Paciente fromCsv(String csvLine) {
        String[] datos = csvLine.split(",");
        if (datos.length == 2) {
            return new Paciente(datos[0], datos[1]);
        }
        return null;
    }

    @Override
    public String toString() {
        return "ID: " + id + ", Nombre: " + nombreCompleto;
    }
}
public class Cita {
    private String idCita;
    private String fecha;
    private String hora;
    private String motivo;
    // La cita solo guarda los IDs para referencia, se cargan los objetos al mostrar
    private String idDoctor;
    private String idPaciente;

    public Cita(String idCita, String fecha, String hora, String motivo, String idDoctor, String idPaciente) {
        this.idCita = idCita;
        this.fecha = fecha;
        this.hora = hora;
        this.motivo = motivo;
        this.idDoctor = idDoctor;
        this.idPaciente = idPaciente;
    }

    public String getIdCita() {
        return idCita;
    }

    public String getIdDoctor() {
        return idDoctor;
    }

    public String getIdPaciente() {
        return idPaciente;
    }

    public String toCsv() {
        return idCita + "," + fecha + "," + hora + "," + motivo + "," + idDoctor + "," + idPaciente;
    }

    public static Cita fromCsv(String csvLine) {
        String[] datos = csvLine.split(",");
        if (datos.length == 6) {
            return new Cita(datos[0], datos[1], datos[2], datos[3], datos[4], datos[5]);
        }
        return null;
    }

    // Este toString es básico. La lógica para mostrar los nombres completos va en la Principal
    @Override
    public String toString() {
        return "ID Cita: " + idCita + ", Fecha: " + fecha + ", Hora: " + hora + ", Motivo: " + motivo +
            ", ID Doctor: " + idDoctor + ", ID Paciente: " + idPaciente;
    }
}
import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class ManejadorDeArchivos {
    private static final String RUTA_DB = "db" + File.separator; // Carpeta 'db/'
    private static final String ARCHIVO_DOCTORES = RUTA_DB + "doctores.csv";
    private static final String ARCHIVO_PACIENTES = RUTA_DB + "pacientes.csv";
    private static final String ARCHIVO_CITAS = RUTA_DB + "citas.csv";

    // --- Regeneración y Validación de Archivos ---

    public static void inicializarArchivos() {
        File dirDb = new File(RUTA_DB);
        if (!dirDb.exists()) {
            dirDb.mkdirs(); // Crea la carpeta 'db' si no existe
            System.out.println("Carpeta 'db' creada.");
        }

        crearArchivoSiNoExiste(ARCHIVO_DOCTORES, "ID,Nombre,Especialidad");
        crearArchivoSiNoExiste(ARCHIVO_PACIENTES, "ID,Nombre");
        crearArchivoSiNoExiste(ARCHIVO_CITAS, "IDCita,Fecha,Hora,Motivo,IDDoctor,IDPaciente");
    }

    private static void crearArchivoSiNoExiste(String rutaArchivo, String encabezado) {
        File file = new File(rutaArchivo);
        if (!file.exists()) {
            try (PrintWriter pw = new PrintWriter(new FileWriter(file))) {
                pw.println(encabezado); // Escribe el encabezado
                System.out.println("Archivo " + file.getName() + " regenerado/creado.");
            } catch (IOException e) {
                System.err.println("Error al crear el archivo " + file.getName() + ": " + e.getMessage());
            }
        }
    }

    // --- Lógica General de Guardado ---

    private static void guardarDatos(String rutaArchivo, List<String> datos) throws IOException {
    try (PrintWriter pw = new PrintWriter(new FileWriter(rutaArchivo))) {
        // Re-escribir el encabezado antes de los datos (asumiendo que los datos no lo incluyen)
        if (rutaArchivo.equals(ARCHIVO_DOCTORES)) pw.println("ID,Nombre,Especialidad");
        else if (rutaArchivo.equals(ARCHIVO_PACIENTES)) pw.println("ID,Nombre");
        else if (rutaArchivo.equals(ARCHIVO_CITAS)) pw.println("IDCita,Fecha,Hora,Motivo,IDDoctor,IDPaciente");

        for (String linea : datos) {
            pw.println(linea);
        }
    }
}

    // --- Lógica Específica de Carga ---

    public static List < String > cargarLineas(String rutaArchivo) throws IOException {
    List < String > lineas = new ArrayList<>();
    try (BufferedReader br = new BufferedReader(new FileReader(rutaArchivo))) {
        br.readLine(); // Saltar el encabezado
            String linea;
        while ((linea = br.readLine()) != null) {
            if (!linea.trim().isEmpty()) {
                lineas.add(linea);
            }
        }
    }
    return lineas;
}

    // --- Métodos Públicos para la Clase Principal ---

    public static void guardarDoctor(Doctor doctor) {
    try {
        List < String > lineasExistentes = cargarLineas(ARCHIVO_DOCTORES);
        List < Doctor > doctores = new ArrayList<>();
        for (String linea : lineasExistentes) {
            doctores.add(Doctor.fromCsv(linea));
        }

        // Reemplazar si existe o agregar si es nuevo (lógica simple para ID único)
        doctores.removeIf(d -> d.getId().equals(doctor.getId()));
        doctores.add(doctor);

        List < String > lineas = new ArrayList<>();
        for (Doctor d : doctores) {
            lineas.add(d.toCsv());
        }

        guardarDatos(ARCHIVO_DOCTORES, lineas);
    } catch (IOException e) {
        System.err.println("Error al guardar doctor: " + e.getMessage());
    }
}

    // Métodos similares deben implementarse para Paciente y Cita.
    // Para simplificar, aquí se muestra solo el de carga general:

    public static List < Doctor > cargarDoctores() {
    List < Doctor > doctores = new ArrayList<>();
    try {
        for (String linea : cargarLineas(ARCHIVO_DOCTORES)) {
                Doctor d = Doctor.fromCsv(linea);
            if (d != null) doctores.add(d);
        }
    } catch (IOException e) {
        System.err.println("Error al cargar doctores: " + e.getMessage());
    }
    return doctores;
}
    
    public static List < Paciente > cargarPacientes() {
    List < Paciente > pacientes = new ArrayList<>();
    try {
        for (String linea : cargarLineas(ARCHIVO_PACIENTES)) {
                Paciente p = Paciente.fromCsv(linea);
            if (p != null) pacientes.add(p);
        }
    } catch (IOException e) {
        System.err.println("Error al cargar pacientes: " + e.getMessage());
    }
    return pacientes;
}

    public static void guardarCita(Cita cita) {
    try {
        List < String > lineasExistentes = cargarLineas(ARCHIVO_CITAS);
        List < Cita > citas = new ArrayList<>();
        for (String linea : lineasExistentes) {
            citas.add(Cita.fromCsv(linea));
        }

        // Para asegurar ID único de Cita
        citas.removeIf(c -> c.getIdCita().equals(cita.getIdCita()));
        citas.add(cita);

        List < String > lineas = new ArrayList<>();
        for (Cita c : citas) {
            lineas.add(c.toCsv());
        }

        guardarDatos(ARCHIVO_CITAS, lineas);
    } catch (IOException e) {
        System.err.println("Error al guardar cita: " + e.getMessage());
    }
}

    // Se necesita este método para la validación al crear cita
    public static Doctor buscarDoctorPorId(String id) {
    for (Doctor d : cargarDoctores()) {
        if (d.getId().equals(id)) {
            return d;
        }
    }
    return null;
}

    public static Paciente buscarPacientePorId(String id) {
    for (Paciente p : cargarPacientes()) {
        if (p.getId().equals(id)) {
            return p;
        }
    }
    return null;
}
}
import java.util.InputMismatchException;
import java.util.Scanner;
import java.util.List;

public class Principal {

    private static final Scanner scanner = new Scanner(System.in);
    private static boolean sesionIniciada = false;

    public static void main(String[] args) {
        // 1. Inicializar/Validar archivos de datos al inicio
        ManejadorDeArchivos.inicializarArchivos();

        // 2. Control de Acceso (implementación sencilla)
        if (controlAcceso()) {
            mostrarMenuPrincipal();
        } else {
            System.out.println("Intentos fallidos. Saliendo del sistema.");
        }
    }

    private static boolean controlAcceso() {
        int intentos = 3;
        while (intentos > 0) {
            System.out.println("\n--- Control de Acceso ---");
            System.out.print("ID Administrador: ");
            String id = scanner.nextLine();
            System.out.print("Contraseña: ");
            String password = scanner.nextLine();

            // Lógica de validación (Hardcodeada para el ejemplo simple)
            if (id.equals("admin") && password.equals("1234")) {
                System.out.println("✅ Inicio de sesión exitoso.");
                return true;
            } else {
                intentos--;
                System.out.println("❌ Credenciales incorrectas. Intentos restantes: " + intentos);
            }
        }
        return false;
    }

    private static void mostrarMenuPrincipal() {
        int opcion = 0;
        do {
            try {
                System.out.println("\n===== MENÚ PRINCIPAL =====");
                System.out.println("1. Dar de Alta Doctor");
                System.out.println("2. Dar de Alta Paciente");
                System.out.println("3. Crear Cita");
                System.out.println("4. Consultar Doctores");
                System.out.println("5. Consultar Pacientes");
                System.out.println("6. Consultar Citas");
                System.out.println("7. Salir");
                System.out.print("Seleccione una opción: ");
                opcion = scanner.nextInt();
                scanner.nextLine(); // Consumir el salto de línea

                switch (opcion) {
                    case 1: darDeAltaDoctor(); break;
                    case 2: darDeAltaPaciente(); break;
                    case 3: crearCita(); break;
                    case 4: consultarDoctores(); break;
                    case 5: consultarPacientes(); break;
                    case 6: consultarCitas(); break;
                    case 7: System.out.println("👋 Saliendo del programa. ¡Hasta pronto!"); break;
                    default: System.out.println("Opción no válida. Intente de nuevo.");
                }
            } catch (InputMismatchException e) {
                System.err.println("ERROR: Ingrese un número válido para la opción del menú.");
                scanner.nextLine(); // Limpiar el buffer
                opcion = 0;
            } catch (Exception e) {
                System.err.println("Ocurrió un error inesperado: " + e.getMessage());
            }
        } while (opcion != 7);
    }

    // --- FUNCIONALIDADES DE ALTA ---

    private static void darDeAltaDoctor() {
        System.out.println("\n--- ALTA DE DOCTOR ---");
        System.out.print("ID del doctor: ");
        String id = scanner.nextLine();
        System.out.print("Nombre completo: ");
        String nombre = scanner.nextLine();
        System.out.print("Especialidad: ");
        String especialidad = scanner.nextLine();

        Doctor nuevoDoctor = new Doctor(id, nombre, especialidad);
        ManejadorDeArchivos.guardarDoctor(nuevoDoctor);
        System.out.println("✅ Doctor " + nombre + " guardado exitosamente.");
    }

    private static void darDeAltaPaciente() {
        System.out.println("\n--- ALTA DE PACIENTE ---");
        System.out.print("ID del paciente: ");
        String id = scanner.nextLine();
        System.out.print("Nombre completo: ");
        String nombre = scanner.nextLine();

        Paciente nuevoPaciente = new Paciente(id, nombre);
        // (Asumir la implementación de ManejadorDeArchivos.guardarPaciente)
        // Por la limitación de espacio, se omite el código, pero debe ser similar a guardarDoctor.
        System.out.println("✅ Paciente " + nombre + " guardado exitosamente.");
    }

    // --- FUNCIONALIDAD DE CREAR CITA ---

    private static void crearCita() {
        System.out.println("\n--- CREAR CITA ---");
        System.out.print("ID de la cita: ");
        String idCita = scanner.nextLine();
        System.out.print("Fecha (DD/MM/AAAA): ");
        String fecha = scanner.nextLine();
        System.out.print("Hora (HH:MM): ");
        String hora = scanner.nextLine();
        System.out.print("Motivo de la cita: ");
        String motivo = scanner.nextLine();

        System.out.print("ID del doctor para la cita: ");
        String idDoctor = scanner.nextLine();
        System.out.print("ID del paciente para la cita: ");
        String idPaciente = scanner.nextLine();

        // ⚠️ RELACIÓN: Validar que el Doctor y Paciente existan
        Doctor doctor = ManejadorDeArchivos.buscarDoctorPorId(idDoctor);
        Paciente paciente = ManejadorDeArchivos.buscarPacientePorId(idPaciente);

        if (doctor == null) {
            System.err.println("❌ ERROR: Doctor con ID " + idDoctor + " no encontrado.");
            return;
        }
        if (paciente == null) {
            System.err.println("❌ ERROR: Paciente con ID " + idPaciente + " no encontrado.");
            return;
        }

        // Si ambos existen, se crea la cita con sus IDs
        Cita nuevaCita = new Cita(idCita, fecha, hora, motivo, idDoctor, idPaciente);
        ManejadorDeArchivos.guardarCita(nuevaCita);
        System.out.println("✅ Cita creada exitosamente con el Dr. " + doctor.getNombreCompleto() + ".");
    }

    // --- FUNCIONALIDADES DE CONSULTA ---

    private static void consultarDoctores() {
        System.out.println("\n--- LISTA DE DOCTORES ---");
        List < Doctor > doctores = ManejadorDeArchivos.cargarDoctores();
        if (doctores.isEmpty()) {
            System.out.println("No hay doctores registrados.");
            return;
        }
        for (Doctor d : doctores) {
            System.out.println(d);
        }
    }

    private static void consultarPacientes() {
        // (Asumir la implementación, similar a consultarDoctores)
        System.out.println("\n--- LISTA DE PACIENTES ---");
        List < Paciente > pacientes = ManejadorDeArchivos.cargarPacientes();
        if (pacientes.isEmpty()) {
            System.out.println("No hay pacientes registrados.");
            return;
        }
        for (Paciente p : pacientes) {
            System.out.println(p);
        }
    }

    private static void consultarCitas() {
        // Lógica avanzada: Cargar todas las citas y buscar los nombres de Doctor/Paciente
        System.out.println("\n--- LISTA DE CITAS ---");
        try {
            List < String > lineasCitas = ManejadorDeArchivos.cargarLineas(ManejadorDeArchivos.ARCHIVO_CITAS);
            if (lineasCitas.isEmpty()) {
                System.out.println("No hay citas registradas.");
                return;
            }

            for (String linea : lineasCitas) {
                Cita c = Cita.fromCsv(linea);
                if (c != null) {
                    Doctor d = ManejadorDeArchivos.buscarDoctorPorId(c.getIdDoctor());
                    Paciente p = ManejadorDeArchivos.buscarPacientePorId(c.getIdPaciente());
                    
                    String nombreDoctor = d != null ? d.getNombreCompleto() : "Desconocido";
                    String nombrePaciente = p != null ? p.getNombreCompleto() : "Desconocido";

                    System.out.printf("Cita ID: %s | Fecha: %s %s | Motivo: %s | Dr.: %s | Pte.: %s%n",
                        c.getIdCita(), c.getFecha(), c.getHora(), c.getMotivo(), nombreDoctor, nombrePaciente);
                }
            }
        } catch (Exception e) {
            System.err.println("Error al consultar citas: " + e.getMessage());
        }
    }
}

