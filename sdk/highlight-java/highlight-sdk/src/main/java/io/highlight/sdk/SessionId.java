package io.highlight.sdk;

import java.net.NetworkInterface;
import java.net.SocketException;
import java.nio.BufferUnderflowException;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Date;
import java.util.Enumeration;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 
 * @author dbs-leipzig
 * @see <a href="https://github.com/dbs-leipzig/gradoop/blob/develop/gradoop-common/src/main/java/org/gradoop/common/model/impl/id/GradoopId.java">GradoopId</a>
 */
class SessionId implements Comparable<SessionId> {

	  /**
	   * Number of bytes to represent an id internally.
	   */
	  public static final int ID_SIZE = 12;

	  /**
	   * Represents a null id.
	   */
	  public static final SessionId NULL_VALUE =
	    new SessionId(0, 0, (short) 0, 0);

	  /**
	   * Integer containing a unique identifier of the machine
	   */
	  private static final int MACHINE_IDENTIFIER;

	  /**
	   * Short containing a unique identifier of the process
	   */
	  private static final short PROCESS_IDENTIFIER;

	  /**
	   * Integer containing a counter that is increased whenever a new id is created
	   */
	  private static final AtomicInteger NEXT_COUNTER = new AtomicInteger(new SecureRandom().nextInt());

	  /**
	   * Bit mask used to extract the lowest three bytes of four
	   */
	  private static final int LOW_ORDER_THREE_BYTES = 0x00ffffff;

	  /**
	   * Bit mask used to extract the highest byte of four
	   */
	  private static final int HIGH_ORDER_ONE_BYTE = 0xff000000;

	  /**
	   * Required for {@link SessionId#toString()}
	   */
	  private static final char[] HEX_CHARS = new char[] {
	    '0', '1', '2', '3', '4', '5', '6', '7',
	    '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};

	  /**
	   * Internal byte representation
	   */
	  private byte[] bytes;

	  static {
	    MACHINE_IDENTIFIER = createMachineIdentifier();
	    PROCESS_IDENTIFIER = createProcessIdentifier();
	  }

	  /**
	   * Required default constructor for instantiation by serialization logic.
	   */
	  public SessionId() {
	    bytes = new byte[ID_SIZE];
	  }

	  /**
	   * Creates a ScriptedItemId from a given byte representation
	   *
	   * @param bytes the ScriptedItemId represented by the byte array
	   */
	  private SessionId(byte[] bytes) {
	    this.bytes = bytes;
	  }

	  /**
	   * Creates a ScriptedItemId using the given time, machine identifier, process identifier, and counter.
	   * <p>
	   * Note: Implementation taken from org.bson.types.ObjectId
	   *
	   * @param timestamp         the time in seconds
	   * @param machineIdentifier the machine identifier
	   * @param processIdentifier the process identifier
	   * @param counter           the counter
	   * @throws IllegalArgumentException if the high order byte of machineIdentifier
	   *                                  or counter is not zero
	   */
	  public SessionId(final int timestamp, final int machineIdentifier,
	    final short processIdentifier, final int counter) {
	    this(timestamp, machineIdentifier, processIdentifier, counter, true);
	  }


	  /**
	   * Creates a ScriptedItemId using the given time, machine identifier, process identifier, and counter.
	   * <p>
	   * Note: Implementation taken from org.bson.types.ObjectId
	   *
	   * @param timestamp         the time in seconds
	   * @param machineIdentifier the machine identifier
	   * @param processIdentifier the process identifier
	   * @param counter           the counter
	   * @param checkCounter      if the constructor should test if the counter is between 0 and
	   *                          16777215
	   */
	  private SessionId(final int timestamp, final int machineIdentifier, final short processIdentifier,
	    final int counter, final boolean checkCounter) {
	    if ((machineIdentifier & HIGH_ORDER_ONE_BYTE) != 0) {
	      throw new IllegalArgumentException("The machine identifier must be between 0" +
	        " and 16777215 (it must fit in three bytes).");
	    }
	    if (checkCounter && ((counter & HIGH_ORDER_ONE_BYTE) != 0)) {
	      throw new IllegalArgumentException("The counter must be between 0" +
	        " and 16777215 (it must fit in three bytes).");
	    }

	    ByteBuffer buffer = ByteBuffer.allocate(12);

	    buffer.put((byte) (timestamp >> 24));
	    buffer.put((byte) (timestamp >> 16));
	    buffer.put((byte) (timestamp >> 8));
	    buffer.put((byte) timestamp);

	    buffer.put((byte) (machineIdentifier >> 16));
	    buffer.put((byte) (machineIdentifier >> 8));
	    buffer.put((byte) machineIdentifier);

	    buffer.put((byte) (processIdentifier >> 8));
	    buffer.put((byte) processIdentifier);

	    buffer.put((byte) (counter >> 16));
	    buffer.put((byte) (counter >> 8));
	    buffer.put((byte) counter);

	    this.bytes = buffer.array();
	  }

	  /**
	   * Creates the machine identifier from the network interface.
	   * <p>
	   * Note: Implementation taken from org.bson.types.ObjectId
	   *
	   * @return a short representing the process
	   */
	  private static int createMachineIdentifier() {
	    int machinePiece;
	    try {
	      StringBuilder sb = new StringBuilder();
	      Enumeration<NetworkInterface> e = NetworkInterface.getNetworkInterfaces();
	      while (e.hasMoreElements()) {
	        NetworkInterface ni = e.nextElement();
	        sb.append(ni.toString());
	        byte[] mac = ni.getHardwareAddress();
	        if (mac != null) {
	          ByteBuffer bb = ByteBuffer.wrap(mac);
	          try {
	            sb.append(bb.getChar());
	            sb.append(bb.getChar());
	            sb.append(bb.getChar());
	          } catch (BufferUnderflowException shortHardwareAddressException) {
	            // mac with less than 6 bytes. continue
	          }
	        }
	      }
	      machinePiece = sb.toString().hashCode();
	    } catch (SocketException t) {
	      machinePiece = new SecureRandom().nextInt();
	    }
	    machinePiece = machinePiece & LOW_ORDER_THREE_BYTES;
	    return machinePiece;
	  }

	  /**
	   * Creates the process identifier.  This does not have to be unique per class loader because
	   * NEXT_COUNTER will provide the uniqueness.
	   * <p>
	   * Note: Implementation taken from org.bson.types.ObjectId
	   *
	   * @return a short representing the process
	   */
	  private static short createProcessIdentifier() {
	    short processId;
	    String processName = java.lang.management.ManagementFactory.getRuntimeMXBean().getName();
	    if (processName.contains("@")) {
	      processId = (short) Integer.parseInt(processName.substring(0, processName.indexOf('@')));
	    } else {
	      processId = (short) java.lang.management.ManagementFactory
	        .getRuntimeMXBean().getName().hashCode();
	    }

	    return processId;
	  }

	  /**
	   * Returns a new ScriptedItemId
	   *
	   * @return new ScriptedItemId
	   */
	  public static SessionId get() {
	    return new SessionId(dateToTimestampSeconds(new Date()), MACHINE_IDENTIFIER,
	      PROCESS_IDENTIFIER, NEXT_COUNTER.getAndIncrement(), false);
	  }

	  /**
	   * Converts a date into the seconds since unix epoch.
	   *
	   * @param time a time
	   * @return int representing the seconds between unix epoch and the given time
	   */
	  private static int dateToTimestampSeconds(final Date time) {
	    return (int) (time.getTime() / 1000);
	  }

	  /**
	   * Returns the Gradoop ID represented by a specified hexadecimal string.
	   * <p>
	   * Note: Implementation taken from org.bson.types.ObjectId
	   *
	   * @param string hexadecimal ScriptedItemId representation
	   * @return ScriptedItemId
	   */
	  public static SessionId fromString(String string) {
	    if (!SessionId.isValid(string)) {
	      throw new IllegalArgumentException(
	        "invalid hexadecimal representation of a ScriptedItemId: [" + string + "]");
	    }

	    byte[] b = new byte[12];
	    for (int i = 0; i < b.length; i++) {
	      b[i] = (byte) Integer.parseInt(string.substring(i * 2, i * 2 + 2), 16);
	    }
	    return new SessionId(b);
	  }

	  /**
	   * Checks if a string can be transformed into a ScriptedItemId.
	   * <p>
	   * Note: Implementation taken from org.bson.types.ObjectId
	   *
	   * @param hexString a potential ScriptedItemId as a String.
	   * @return whether the string could be an object id
	   * @throws IllegalArgumentException if hexString is null
	   */
	  public static boolean isValid(final String hexString) {
	    if (hexString == null) {
	      throw new IllegalArgumentException();
	    }

	    int len = hexString.length();
	    if (len != 24) {
	      return false;
	    }

	    for (int i = 0; i < len; i++) {
	      char c = hexString.charAt(i);
	      if (c >= '0' && c <= '9') {
	        continue;
	      }
	      if (c >= 'a' && c <= 'f') {
	        continue;
	      }
	      if (c >= 'A' && c <= 'F') {
	        continue;
	      }

	      return false;
	    }

	    return true;
	  }

	  /**
	   * Returns the Gradoop ID represented by a byte array
	   *
	   * @param bytes byte representation
	   * @return Gradoop ID
	   */
	  public static SessionId fromByteArray(byte[] bytes) {
	    return new SessionId(bytes);
	  }

	  /**
	   * Returns byte representation of a ScriptedItemId
	   *
	   * @return Byte representation
	   */
	  public byte[] toByteArray() {
	    return bytes;
	  }

	  /**
	   * Checks if the specified object is equal to the current id.
	   *
	   * @param o the object to be compared
	   * @return true, iff the specified id is equal to this id
	   */
	  @Override
	  public boolean equals(Object o) {
	    if (this == o) {
	      return true;
	    }
	    if (o == null || getClass() != o.getClass()) {
	      return false;
	    }

	    byte[] firstBytes = this.bytes;
	    byte[] secondBytes = ((SessionId) o).bytes;
	    for (int i = 0; i < SessionId.ID_SIZE; i++) {
	      if (firstBytes[i] != secondBytes[i]) {
	        return false;
	      }
	    }
	    return true;
	  }

	  /**
	   * Returns the hash code of this ScriptedItemId.
	   * <p>
	   * Note: Implementation taken from org.bson.types.ObjectId
	   *
	   * @return hash code
	   */
	  @Override
	  public int hashCode() {
	    int result = getTimeStamp();
	    result = 31 * result + getMachineIdentifier();
	    result = 31 * result + (int) getProcessIdentifier();
	    result = 31 * result + getCounter();
	    return result;
	  }

	  /**
	   * Performs a byte-wise comparison of this and the specified ScriptedItemId.
	   *
	   * @param other the object to be compared.
	   * @return a negative integer, zero, or a positive integer as this object
	   * is less than, equal to, or greater than the specified object.
	   */
	  @Override
	  public int compareTo(SessionId other) {

	    for (int i = 0; i < SessionId.ID_SIZE; i++) {
	      if (this.bytes[i] != other.bytes[i]) {
	        return ((this.bytes[i] & 0xff) < (other.bytes[i] & 0xff)) ? -1 : 1;
	      }
	    }
	    return 0;
	  }

	  /**
	   * Returns hex string representation of a ScriptedItemId.
	   * <p>
	   * Note: Implementation taken from org.bson.types.ObjectId
	   *
	   * @return ScriptedItemId string representation.
	   */
	  @Override
	  public String toString() {
	    char[] chars = new char[24];
	    int i = 0;
	    for (byte b : bytes) {
	      chars[i++] = HEX_CHARS[b >> 4 & 0xF];
	      chars[i++] = HEX_CHARS[b & 0xF];
	    }
	    return String.valueOf(chars);
	  }

	  //------------------------------------------------------------------------------------------------
	  // private little helpers
	  //------------------------------------------------------------------------------------------------

	  /**
	   * Returns the timestamp component of the id.
	   *
	   * @return the timestamp
	   */
	  private int getTimeStamp() {
	    return makeInt(bytes[0], bytes[1], bytes[2], bytes[3]);
	  }

	  /**
	   * Returns the machine identifier component of the id.
	   *
	   * @return the machine identifier
	   */
	  private int getMachineIdentifier() {
	    return makeInt((byte) 0, bytes[4], bytes[5], bytes[6]);
	  }

	  /**
	   * Returns the process identifier component of the id.
	   *
	   * @return the process identifier
	   */
	  private short getProcessIdentifier() {
	    return (short) makeInt((byte) 0, (byte) 0, bytes[7], bytes[8]);
	  }

	  /**
	   * Returns the counter component of the id.
	   *
	   * @return the counter
	   */
	  private int getCounter() {
	    return makeInt((byte) 0, bytes[9], bytes[10], bytes[11]);
	  }


	  //------------------------------------------------------------------------------------------------
	  // static helper functions
	  //------------------------------------------------------------------------------------------------

	  /**
	   * Compares the given ScriptedItemIds and returns the smaller one. It both are equal, the first
	   * argument is returned.
	   *
	   * @param first  first ScriptedItemId
	   * @param second second ScriptedItemId
	   * @return smaller ScriptedItemId or first if equal
	   */
	  public static SessionId min(SessionId first, SessionId second) {
	    int comparison = first.compareTo(second);
	    return comparison == 0 ? first : (comparison < 0 ? first : second);
	  }

	  /**
	   * Returns a primitive int represented by the given 4 bytes.
	   *
	   * @param b3 byte 3
	   * @param b2 byte 2
	   * @param b1 byte 1
	   * @param b0 byte 0
	   * @return int value
	   */
	  private static int makeInt(final byte b3, final byte b2, final byte b1, final byte b0) {
	    return (b3 << 24) | ((b2 & 0xff) << 16) | ((b1 & 0xff) << 8) | ((b0 & 0xff));
	  }
}